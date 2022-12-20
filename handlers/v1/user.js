const path = require('path');
const fs = require('fs');
const moment = require('../../configs/moment');
const UUID = require('uuid');
const { Op } = require('sequelize');
const excel = require('exceljs');

const UserValidator = require('../../validators/user');
const db = require('../../configs/sequelize');
const gcs = require('../../configs/gcs');
const BcryptHelper = require('../../utils/bcrypt');
const JwtHelper = require('../../utils/jwt');
const StrHelper = require('../../utils/str');
const EmailHelper = require('../../utils/email-helper');
const FCMHelper = require('../../utils/fcm-helper');
const StrInvest = require('../../utils/lib/store-invest');
const Notification = require('./notification');
const Pagination = require('../../utils/pagination');
const Sequelize = require('sequelize');

const EMAIL_TEMPLATES = require('../../email-templates');
const UserService = require('../../services/users.service');
const ScheduleCallService = require('../../services/schedule-call.service');

const loginRole = async (req, res, role_id, login_invest = false) => {
  const validator = UserValidator.validateLogin(req);
  if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
    errors: validator.error
  });

  const formData = validator.data;
  const roleClause = role_id ? {role_id: { [Op.in]: [role_id,3] } } : {};

  let user = await db.models.users.findOne({
    where: {
      email: formData.email,
      status: { [Op.ne]: 0 },
      ...roleClause
    },
    include: [
      {
        model: db.models.roles,
        as: 'role'
      }, 'merchant'
    ]
  })

  if (!user && login_invest) {
    const check = await StrInvest.login(formData.email, formData.password);
    if (check.status_code === 200) {
      const userStoreData = await StrInvest.getProfileDetail(check.apiKey);
      user = await db.models.users
        .create({
          role_id: 2,
          name: userStoreData.welcomeName,
          contact_no: userStoreData.mobile_no ? `${userStoreData.mobile_country_code} ${userStoreData.mobile_no}` : null,
          gender: userStoreData.escrow.gender === 'F' ? 'female' : 'male',
          avatar_url: userStoreData.user_profile_image,
          birth_date: userStoreData.escrow.birthdate ? moment(userStoreData.escrow.birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null,
          email: formData.email,
          password: BcryptHelper.hash(formData.password),
          status: 1,
          is_store_user: 1
        });
    } else {
      return BaseResponse.BadResponse(res, 'User not found');
    }
  }

  if(!user || (user && !user.password)) return BaseResponse.UnprocessableEntity(res, "It seems that your account can't be fetch from Store Backend DB. Please try to login again and check your details. If problem persist, do contact Store Backend Admin about your account for further details. Thank You!"); // or system may have problem fetching details from Store Invest server also. Thank You!");
  const checkPassword = BcryptHelper.check(formData.password, user.password);

  // Check if merchant is login and merchant account has been approved
  const { merchant } = user;
  if (merchant) {
    if (!(+merchant.status)) {
      return BaseResponse.BadResponse(res, 'Your account is not approved. Please contact Store Backend Admin about your account for further details. Thank You!');
    }
  }

  if (checkPassword) {
    const jwtToken = await JwtHelper.generateJwt({
      id: user.id,
      name: user.name,
      email: user.email
    });

    const userProfile = user.toJSON();
    
    // calculate points for return data (not save it to db)
    userProfile['points'] = userProfile['points'] + userProfile['invest_points'];
    
    delete userProfile['invest_points'];
    delete userProfile['password'];

    // Added by Frank. Adding fcm token to user
    const fcm_token = req.body.fcm_token ? req.body.fcm_token : null;
    const fcm_topics = req.body.fcm_topics ? req.body.fcm_topics : null;
    await FCMHelper.addUserFcm(userProfile.id,fcm_token,fcm_topics);
    // ========================================

    return BaseResponse.Success(res, 'Login Success', {
      accessToken: jwtToken.value,
      user: userProfile
    });
  } else {
    return BaseResponse.BadResponse(res, 'Password incorrect');
  }
}

class UserHandler {


  async register(req, res) {
    const validator = await UserValidator.validateRegister(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    const user = await db.models
      .users
      .create({
        role_id: 2,
        name: formData.name,
        email: formData.email,
        password: BcryptHelper.hash(formData.password),
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURI(formData.name)}&color=7F9CF5&background=EBF4FF`,
        contact_no: formData.phone_code && formData.phone_number ? `${formData.phone_code} ${formData.phone_number}` : null,
        // gender: formData.gender,
        status: 1,
        is_store_user: 0
      });

    // adding push & email notif setting after register
    let data_user_notif = {
      user_id: user.id
    };
    const userEmailotification = await db.models.email_notifications.findOne({where: {user_id: user.id}})
    const userPushNotification = await db.models.push_notifications.findOne({where: {user_id: user.id}})
    if (!userPushNotification) {
      await db.models.push_notifications.create(data_user_notif);
    }
    if(req.body.enable_newsletter) data_user_notif.newsletters = 1;
    if (!userEmailotification) {
      await db.models.email_notifications.create(data_user_notif);
    }else{
      if(req.body.enable_newsletter){
        await userEmailotification.update({
          newsletters: 1
        });
      }
    }

    const jwtToken = await JwtHelper.generateJwt({
      id: user.id,
      name: user.name,
      email: user.email
    })

    const userProfile = user.toJSON();
    delete userProfile['password'];

    // Added by Frank. Adding fcm token to user
    await FCMHelper.addUserFcm(userProfile.id,formData.fcm_token,formData.fcm_topics);
    // ========================================

    // Trigger welcome new user
    UserService.welcomeNewUser(user);
    // End trigger welcome new user

    UserService.CNYTREATVoucher(user);

    // Trigger global voucher for new user
    UserService.applyGlobalVoucherForNewUser(user);
    // End Trigger global voucher for new user

    return BaseResponse.Success(res, 'Register successfully', {
      accessToken: jwtToken.value,
      user: userProfile
    });
  }

  async loginRoleCheck(req, res, next) {
    const user = await db.models
      .users
      .findOne({
        where: {
          email: req.body.email
        }
      });

    if (!user) return BaseResponse.BadResponse(res, 'User not found');

    return await loginRole(req, res, user.role_id);
  }

  async login(req, res, next) {
    return await loginRole(req, res, false);
  }

  async loginSuperadmin(req, res, next) {
    return await loginRole(req, res, 1);
  }

  async loginInvest(req, res) {
    return await loginRole(req, res, false, true);
  }

  async getProfile(req, res) {
    
    try {
      // let userStrInvestPoints = await db.models.user_store_invest_points
      //   .findOne({
      //     where: { user_id: req.user.id },
      //     order: [ [ 'id', 'DESC' ]]
      //   })

      // if (userStrInvestPoints) {
      //   userStrInvestPoints = userStrInvestPoints.points
      // } else {
      //   userStrInvestPoints = 0;
      // }
      
      // // Get latest total of user_points table
      // let userPointsSum = await db.models.user_points.findOne({
      //   attributes: [
      //     [Sequelize.fn('SUM', Sequelize.col('points')), 'points'],
      //   ],
      //   where: {
      //     user_id: req.user.id,
      //   },
      //   group: ['user_id']
      // })
      // if (userPointsSum) {
      //   userPointsSum = parseInt(userPointsSum.points)
      // } else {
      //   userPointsSum = 0;
      // }

      // req.user.points = await userPointsSum + userStrInvestPoints;
      // await req.user.save();
      
      const user = req.user.publicJSON();
      const phone = req.user.contact_no ? req.user.contact_no.split(' ') : [null, null];
      user.phone_code = phone[0] ?? null;
      user.phone_number = phone[1] ?? null;
      return BaseResponse.Success(res, 'Get Profile Success', {user: user});

    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }

  }

  async loginByInvestToken(req, res) {
    const validator = UserValidator.validateLoginByToken(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const token = validator.data.token;
    const userStoreData = await StrInvest.getProfileDetail(token);
    if (!userStoreData.success) return BaseResponse.BadResponse(res, 'Token invalid');

    let user = await db.models.users
      .findOne({
        where: {
          email: userStoreData.email_address
        }
      });

    // check if the user doesnt have store_invest_id yet
    if (user && !user.store_invest_id) {
      user.store_invest_id = +userStoreData.user_id;
      await user.save();
    }
    
    if (!user) {
      user = await db.models.users
        .create({
          role_id: 2,
          name: userStoreData.welcomeName,
          contact_no: userStoreData.mobile_no ? `${userStoreData.mobile_country_code} ${userStoreData.mobile_no}` : null,
          gender: userStoreData.escrow.gender === 'F' ? 'female' : 'male',
          avatar_url: userStoreData.user_profile_avatar || userStoreData.user_profile_image || '',
          birth_date: userStoreData.escrow.birthdate ? moment(userStoreData.escrow.birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null,
          email: userStoreData.email_address,
          password: BcryptHelper.hash(StrHelper.randomString(64)),
          status: 1,
          is_store_user: 1,
          store_invest_id: +userStoreData.user_id,
          invest_points: +userStoreData.points,
        });
    }

    user.store_invest_token = token;
    await user.save();

    const jwtToken = await JwtHelper.generateJwt({
      id: user.id,
      name: user.name,
      email: user.email
    });

    const userProfile = user.toJSON();
    
    // calculate points for return data (not save it to db)
    userProfile['points'] = userProfile['points'] + userProfile['invest_points'];

    delete userProfile['invest_points'];
    delete userProfile['password'];

    // Added by Frank. Adding fcm token to user
    const fcm_token = req.body.fcm_token ? req.body.fcm_token : null;
    const fcm_topics = req.body.fcm_topics ? req.body.fcm_topics : null;
    await FCMHelper.addUserFcm(userProfile.id,fcm_token,fcm_topics);
    // ========================================

    return BaseResponse.Success(res, 'Login Success', {
      accessToken: jwtToken.value,
      user: userProfile
    });
  }

  async updateName(req, res) {
    const validator = UserValidator.validateUpdateName(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    req.user.name = formData.name;
    req.user.save()
      .then(() => {
        return BaseResponse.Success(res, 'Name successfully updated', {
          user: req.user.toJSON()
        })
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async updateGender(req, res) {
    const validator = UserValidator.validateUpdateGender(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    req.user.gender = formData.gender;
    req.user.save()
      .then(() => {
        return BaseResponse.Success(res, 'Gender successfully updated', {
          user: req.user.toJSON()
        })
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async updatePhone(req, res) {
    const validator = UserValidator.validateUpdatePhone(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    req.user.contact_no = `${formData.phone_code} ${formData.phone_number}`;
    req.user.save()
      .then(() => {
        return BaseResponse.Success(res, 'Phone successfully updated', {
          user: req.user.toJSON()
        })
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async updatePassword(req, res) {
    const validator = UserValidator.validateUpdatePassword(req);

    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    const user = await db.models.users.findOne({
      attributes: ['password'],
      where: {
        id: req.user.id
      }
    })

    const checkPassword = BcryptHelper.check(formData.old_password, user.password);
    if (!checkPassword) return BaseResponse.BadResponse(res, 'Old password is incorrect');

    req.user.password = BcryptHelper.hash(formData.new_password);
    req.user.save()
      .then(() => {
        const user = req.user.toJSON();
        delete user.password;
        return BaseResponse.Success(res, 'Password successfully updated', {
          user
        })
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async updateAvatar(req, res) {
    const validator = UserValidator.validateUpdateAvatar(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;
    const avatar = formData.avatar;
    const uuid = UUID.v4();
    // Set custom destination path
    const destinationPath = `avatar/${StrHelper.slug(req.user.name)}-${uuid}${StrHelper.getFileExtension(avatar.name)}`;
    // Upload to GCS
    const upload = await gcs.bucket(process.env.GCS_BUCKET_NAME).upload(avatar.tempFilePath, {
      destination: destinationPath,
    });
    // Get file upload
    const file = upload[0];

    // Update user avatar url
    req.user.avatar_url = file.publicUrl();
    await req.user.save();

    // Delete temporary file
    fs.unlink(avatar.tempFilePath, () => {
    });
    return BaseResponse.Success(res, 'Avatar updated successfully', {
      user: req.user
    })
  }

  async updateBirthDate(req, res) {
    const validator = UserValidator.validateUpdateBirthDate(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    req.user.birth_date = formData.birth_date;
    req.user.save()
      .then(() => {
        return BaseResponse.Success(res, 'Birth date successfully updated', {
          user: req.user.toJSON()
        })
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  // =====================
  // script added by frank
  async forgotPassword(req, res) {
    try {
      const validator = UserValidator.validateForgotPassword(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;

      const user = await db.models.users.findOne({
        where: {
          email: formData.email
        }
      })

      if (!user) return BaseResponse.UnprocessableEntity(res, "Email does not exist in our system!");

      const reset_code = Math.floor(100000 + Math.random() * 900000);
      await user.update({reset_code: reset_code});

      // Prepare the email template
      const htmlTemplate = EmailHelper.prepareTemplate({
        template: EMAIL_TEMPLATES.FORGOT_PASSWORD,
        data: {
          reset_code: reset_code,
          name: user.name,
          email: user.email,
        }
      })

      const locals = {
        email: user.email,
        subject: 'Forgot Password',
        template: htmlTemplate
      };

      const sendEmailResponse = await EmailHelper.sendMail(locals);
      if (sendEmailResponse.error) {
        return BaseResponse.BadResponse(res, sendEmailResponse.error, {});
      }

      return BaseResponse.Success(res, 'Successfully sent your reset code to your email', {});
    } catch(err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async resetPassword(req, res) {
    const validator = UserValidator.validateResetPassword(req);

    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    const user = await db.models.users.findOne({
      where: {
        email: formData.email,
        reset_code: formData.reset_code
      }
    })

    if (!user) return BaseResponse.UnprocessableEntity(res, "Invalid Email or Reset Code!");

    const newpassword = BcryptHelper.hash(formData.new_password);
    user.update({password: newpassword})
      .then(() => {
        const data = user.toJSON();
        delete data.password;
        return BaseResponse.Success(res, 'Password successfully updated', {
          data
        })
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async saveUserFcm(user_id, fcm_token = null) {

  }

  async setDefaultAddress(req, res) {

    const userId = req.user.id;
    const userAddressId = req.body.user_address_id

    if(!req.body.user_address_id || isNaN(req.body.user_address_id))
      return BaseResponse.BadResponse(res, 'User Address Id required is numeric');

    const userAddress = await db.models.user_addresses.findAll({
      where: {
        user_id: userId,
        id: userAddressId
      }
    });

    db.models.users.update({
      default_address: userAddressId,
    }, {
      where: {
        id: userId
      }
    }).then(async (result) => {
      return BaseResponse.Success(res, 'User Address updated', {
        data: userAddress,
      })
    }).catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })

  }

  // ========================

  /* User CRUD */
  async createUser(req, res) {
    const validator = await UserValidator.validateCreateUser(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    const user = await db.models
      .users
      .create({
        role_id: formData.role_id,
        name: formData.name,
        email: formData.email,
        password: BcryptHelper.hash(formData.password),
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURI(formData.name)}&color=7F9CF5&background=EBF4FF`,
        contact_no: formData.phone_code && formData.phone_number ? `${formData.phone_code} ${formData.phone_number}` : null,
        // gender: formData.gender,
        status: 1,
        is_store_user: 0
      });

    // adding push & email notif setting after register
    const userEmailotification = await db.models.email_notifications.findOne({where: {user_id: user.id}})
    if (!userEmailotification) {
      await db.models.email_notifications.create({
        user_id: user.id
      });
    }
    const userPushNotification = await db.models.push_notifications.findOne({where: {user_id: user.id}})
    if (!userPushNotification) {
      await db.models.push_notifications.create({
        user_id: user.id
      });
    }

    const userProfile = user.toJSON();
    delete userProfile['password'];
    return BaseResponse.Success(res, 'User added successfully', {
      user: userProfile
    });
  }

  async getUserList(req, res) {
    const clause = { where: {}, include: ['role'] };
    let {keyword, status, store_user, role} = req.query;
    if (keyword) {
      clause.where = {
        [Op.or]: [
          {
            name: {[Op.like]: `%${keyword}%`}
          },
          {
            email: {[Op.like]: `%${keyword}%`}
          },
          {
            contact_no: {[Op.like]: `%${keyword}%`}
          },
        ]
      }
    }

    status = status ? parseInt(status) : -1;
    if ([0, 1].includes(status)) clause.where.status = status;

    store_user = store_user ? parseInt(store_user) : -1;
    if ([0, 1].includes(store_user)) clause.where.is_store_user = store_user;

    role = role ? parseInt(role) : -1;
    if ([1, 2, 3].includes(role)) clause.where.role_id = role;

    return await Pagination.paging(req, res, db.models.users, clause);
  }

  async updateUser(req, res) {
    const validator = UserValidator.validateUpdateUser(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;
    const userId = req.params.user_id;
  
    if(req.user.role_id === 3 && req.user.id !== userId) return BaseResponse.Forbidden(res);

    const user = await db.models.users
      .findOne({
        where: {
          id: userId
        }
      });
    
    if (!user) return BaseResponse.BadResponse(res, 'User not found');
    
    user.name = formData.name ?? user.name;
    user.password = formData.password ? BcryptHelper.hash(formData.password) : user.password;
    user.role_id = formData.role_id ?? user.role_id;
    user.birth_date = formData.birth_date ?? user.birth_date;
    user.contact_no = formData.phone_number ? `${formData.phone_code} ${formData.phone_number}` : user.contact_no;
    user.gender = formData.gender ?? user.gender;
    await user.save();

    return BaseResponse.Success(res, 'User successfully updated', {
      user
    });
  }

  async deleteUser(req, res) {
    try{
      const user_id = req.params.user_id;
      const user = await db.models.users
        .findOne({
          where: {
            id: user_id
          }
        });

      if (!user) return BaseResponse.BadResponse(res, 'User not found');
      user.status = 0;
      await user.save();

      return BaseResponse.Success(res, 'User successfully Deactivated');
    }catch(err){
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async deleteUserAlt(req, res) {
        try{
          if (!req.user.is_superadmin && (req.body.user_id && req.user.id != parseInt(req.body.user_id)) ) return BaseResponse.BadResponse(res, "You don't have access rights to update user details");
          const user_id = parseInt(req.body.user_id);
          const user = await db.models.users
            .findOne({
              where: {
                id: user_id
              }
            });
    
          if (!user) return BaseResponse.BadResponse(res, 'User not found');
          user.status = 0;
          await user.save();
    
          return BaseResponse.Success(res, 'User successfully Deactivated');
        }catch(err){
          return BaseResponse.BadResponse(res, err.message);
        }
      }
  async exportUser(req, res) {
    const validator = UserValidator.validateExportUser(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;
    const start = formData.start ?? moment('2000-01-01').format('YYYY-MM-DD');
    const end = formData.end ?? moment().format('YYYY-MM-DD');
    
    const clause = {
      created_at: {
        [Op.between]: [start, end]
      }
    }
    
    const type = formData.type;
    if(type) clause.role_id = type;

    const users = await db.models.users
      .findAll({
        where: clause
      });
    
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("List of Users");
    worksheet.columns = [
      { header: "Id", key: "id", width: 5 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 20 },
      { header: "Register Date", key: "register_date", width: 10 },
    ];

    const sheetData = [];
    for (const user of users) {
      sheetData.push({
        id: user.id,
        name: user.name,
        email: user.email,
        register_date: moment(user.created_at).format('YYYY-MM-DD')
      })
    }

    worksheet.addRows(sheetData);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "store-users.xlsx"
    );
    
    await workbook.xlsx.write(res);

    res.status(200).end();
  }

  async addPoints(req, res, next) {
    try {
      const {points, user_id} = req.body;
      if (!points || !user_id) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      if (isNaN(+points) || +points <= 0) {
        return BaseResponse.BadRequest(res, 'Points must be number and greater than 0');
      }

      const user = await db.models.users.findOne({
        attributes: ['id', 'points'],
        where: {
          id: user_id,
        }
      });

      if (!user) {
        return BaseResponse.BadRequest(res, 'User not found');
      }

      const userPoints = user.points ?? 0;
      user.points = userPoints + +points;
      const result = await user.save();
      return BaseResponse.Success(res, 'Update points success.', {data: result});
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getMyScheduleCalls(req, res, next) {
    try {
      const { user } = req;
      const { status } = req.query;
      const clause = {
        where: {
          user_id: user.id,
        }
      };

      if (status) {
        clause.where.status = status;
      }

      const includes = [
        {
          as: 'merchant',
          model: db.models.merchants,
          attributes: ['name', 'office_phone_number']
        }
      ];

      return Pagination.paging(req, res, db.models.schedule_calls, clause, includes);
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async createUserViaInvestEmail(req, res, next) {
    try {
      const {email} = req.body;
      if (!email) {
        return BaseResponse.BadRequest(res, 'Missing required params.');
      }

      const storeUser = await StrInvest.getProfileByEmail(email);

      const {
        email_address,
        welcomeName,
        mobile_country_code = '+65',
        mobile_no,
        user_id,
        points = 0,
        user_profile_avatar,
        user_profile_image,
        escrow,
      } = storeUser;
      const { gender, birthdate } = escrow || {};
      const avatar_url = user_profile_image || '';

      const password = BcryptHelper.hash(StrHelper.randomString(64));

      const newUser = {
        role_id: 2,
        name: welcomeName,
        contact_no: mobile_no ? `${mobile_country_code} ${mobile_no}` : null,
        gender: gender && gender === 'F' ? 'female' : 'male',
        avatar_url,
        birth_date: birthdate ? moment(birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null,
        email: email_address,
        password,
        status: 1,
        is_store_user: 1,
        store_invest_id: +user_id,
        invest_points: +points,
      }

      const user = await db.models.users.create(newUser);

      return BaseResponse.Success(res, 'create user success', { data: user });
    } catch (err) {
      console.log('create via invest email err: ', err);
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new UserHandler;

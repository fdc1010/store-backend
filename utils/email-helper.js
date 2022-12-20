const sgMail = require('@sendgrid/mail');

const Handlebars = require("handlebars");

const EMAIL_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER = process.env.SENDGRID_SENDER;

const ALLOWED_EMAIL_FOR_QA = ['yopmail.com'];

class EmailService {
  constructor() {
    this.mailer = sgMail;
    this.mailer.setApiKey(EMAIL_API_KEY);
    this.sender = SENDER;
    this.templateCompiler = Handlebars;
  }

  prepareMessage({
    receivers,
    subject,
    html,
    text,
  }) {
    const filteredReceivers = process.env.NODE_ENV === 'production'
      ? receivers
      : receivers.filter(email => {
        const ext = email.split('@')[1];
        const allowedIndex = ALLOWED_EMAIL_FOR_QA.indexOf(ext);
        return allowedIndex >= 0;
      });

    if (!filteredReceivers || !filteredReceivers.length) {
      return null;
    }

    const msg = {
      from: {
        name: 'B Mart',
        email: this.sender,
      },
      to: filteredReceivers,
      subject: subject,
    };

    if (text) {
      msg.text = text;
    }

    if (html) {
      msg.html = html;
    }

    return msg;
  }

  prepareTemplate({template = '', data = {}}) {
    const templateParser = this.templateCompiler.compile(template);
    return templateParser(data);
  }

  async sendMail(data) {
    try {
      const { email, subject, template, name, description, } = data;
      if (!email) {
        return {success: false, error: 'empty message or receivers'}
      }
      const msg = this.prepareMessage({
        receivers: [email],
        subject,
        html: template,
        text: description,
      });
      if (!msg) {
        return {success: false, error: 'empty message or receivers'}
      }
      // Sync we disable send email feature.
      const response = await this.mailer.send(msg);
      // We can do log to log central here before return the data
      return {success: true, error: null};
    } catch(err) {
      const errorBody = err?.response?.body;
      const errors = errorBody?.errors || [];
      const message = errors[0]?.message || err.message || 'Something went wrong. Please try again later.';
      // We can do log to log central here before return the data
      const error = new Error(message);
      error.code = err?.code || 500;
      throw error;
    }
  }
  
  /**
   *
   * @param {string} templateId
   * @param {object} data
   * @returns {Promise<[ClientResponse, {}]>}
   */
  sendMailFromTemplate(templateId, data = {}){
    let { from, email, subject} = data;
    
    if (process.env.NODE_ENV !== 'production' && !email.match(/^.*@yopmail.com$/)) {
      email = 'ios@yopmail.com'
    }
    
    const mail = {
      // from: from ?? '8055_BMART@store.tech',
      from: this.sender,
      to: email,
      subject,
      templateId: templateId,
      dynamic_template_data: data.data
    }
    
    return this.mailer.send(mail);
  }
}

module.exports =  new EmailService();

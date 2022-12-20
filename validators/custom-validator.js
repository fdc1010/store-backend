class CustomValidator {
  validateSchemaOnQuery(Schema, req) {
    const validate = Schema.validate(req.query);
    if (validate.error) {
      return {
        success: false,
        message: validate.error.message,
        error: validate.error.details
      };
    }

    return {
      success: true,
      data: validate.value
    };
  }

  validateSchema(Schema, req, files = undefined) {
    const validate = Schema.validate(req.body);
    if (validate.error) {
      return {
        success: false,
        message: validate.error.message,
        error: validate.error.details
      };
    }

    if(files) validate.value.files = files;

    return {
      success: true,
      data: validate.value
    };
  }

  async validateSchemaAsync(Schema, req, files = undefined) {
    try {
      const validate = await Schema.validateAsync(req.body);
      if (validate.error) {
        return {
          success: false,
          message: validate.error.message,
          error: validate.error.details
        };
      }

      if(files) validate.files = files;
      
      return {
        success: true,
        data: validate
      };
    } catch (e) {
      return {
        success: false,
        message: e.message,
        error: e.details ? (e.details[0] ? e.details[0]: '') : ''
      }
    }
  }
}

module.exports = CustomValidator;

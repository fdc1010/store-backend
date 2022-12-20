const Sequelize = require('sequelize');
const date = require('date-and-time');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    delivery_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product_deliveries',
        key: 'id'
      }
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product_categories',
        key: 'id'
      }
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product_brands',
        key: 'id'
      }
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    variant: {
      type: DataTypes.JSON,
      allowNull: true,
      // Added by frank
      get: function(){
        const varValue = this.getDataValue('variant');
        // console.log("varValue",varValue);
        let hasError = false;
        if(varValue && typeof varValue !== 'undefined'){
          varValue.map( elem => {
            if(!elem.name || typeof elem.name === "undefined") hasError = true;
            // console.log("!elem.name || typeof elem.name === undefined",hasError);
            if(elem.name && typeof elem.name !== 'string') hasError = true;
            // console.log("elem.name && typeof elem.name !== 'string'",hasError);
            if(!elem.value || typeof elem.value === "undefined") hasError = true;
            // console.log("!elem.value || typeof elem.value === 'undefined'",hasError);
            if(elem.value && !Array.isArray(elem.value) && elem.value.length == 0) hasError = true;
            // console.log("elem.value && !Array.isArray(elem.value) && elem.value.length == 0",hasError);
            if(elem.value && typeof elem.value !== 'undefined' && Array.isArray(elem.value) && elem.value.length > 0){ 
              // console.log("elem.value",elem.value);
              elem.value.map(value => {
                if(!value.name || typeof value.name === "undefined") hasError = true;
                // console.log("!value.name || typeof value.name === 'undefined'",hasError);
                // if(!value.sale_price || typeof value.sale_price === "undefined") hasError = true;
                // console.log("!value.sale_price || typeof value.sale_price === 'undefined'",hasError);
                // if(!value.retail_price || typeof value.retail_price === "undefined") hasError = true;
                // console.log("!value.retail_price || typeof value.retail_price === 'undefined'",hasError);
                if((!value.quantity && value.quantity !== 0) || typeof value.quantity === "undefined") hasError = true;
                // console.log("!value.quantity || typeof value.quantity === 'undefined'",hasError);
              });
            }
            
          });
        }
        let variant_value = varValue;
        // console.log("hasError",hasError);
        if (hasError || !varValue) {
          variant_value = [{
              name: "variant name",
              value: [
                {
                  name: "value name",
                  sell_price: 0.0,
                  retail_price: 0.0,
                  quantity: 0
                }
              ]
          }]
        }

        return variant_value;
        
      },
      set: function(value){
        if(value && typeof value !== "undefined") this.setDataValue('variant',JSON.parse(value));
      },
      // ==============
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    manufacturer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    retail_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    sell_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    available_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_featured: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    is_recommended: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    is_hot: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    is_popular: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    is_new: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    is_top: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    status_name: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        const PRODUCT_STATUSES = ['Inactive','Pending','Approved','Rejected','Live','Draft'];
        return PRODUCT_STATUSES[parseInt(this.getDataValue('status'))];
      },
      set: function(value){
        
      },
    },
    // my_likes: {
    //   type: DataTypes.VIRTUAL,
    //   allowNull: true,
    //   get: function(){       
    //     console.log("this.getDataValue('product_likes')",this.getDataValue('product_likes'));
    //     return this.getDataValue('product_likes') && this.getDataValue('product_likes').length > 0 ? 1 : 0;
    //   },
    //   set: function(value){
        
    //   },
    // },
    brand_name: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        return this.getDataValue('brand') ? this.getDataValue('brand').name : '';
      },
      set: function(value){
        
      },
    },
    category_name: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        return this.getDataValue('category') ? this.getDataValue('category').name : '';
      },
      set: function(value){
        
      },
    },
    delivery_name: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        return this.getDataValue('delivery') ? this.getDataValue('delivery').name : '';
      },
      set: function(value){
        
      },
    },
    merchant_name: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        return this.getDataValue('merchants') ? this.getDataValue('merchants').name : '';
      },
      set: function(value){
        
      },
    },
    avg_rating: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        let obj = null;
        const product_reviews = this.getDataValue('product_reviews');
        if(product_reviews) obj = Object.values(product_reviews);
        
        return obj && obj[0] ? obj[0].toJSON().avg_rating : 0;
      },
      set: function(value){
        
      },
    },
    product_details: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){

        let variant = "";
        if(this.getDataValue('variant')){
          const elem =this.getDataValue('variant');
          
          if(elem && typeof elem !== 'undefined'){
           
            variant += elem.map(valueVar =>{
                        let varValue = `${valueVar.name}: `;
                        if(valueVar.value && typeof valueVar.value !== 'undefined' && Array.isArray(valueVar.value)){
                          varValue += valueVar.value.map(key => {
                                      return `\r\n${key.name}:\r\nsale_price: ${key.sale_price}\r\nretail_price: ${key.retail_price}\r\nquantity: ${key.quantity}\r\n`;              
                                  });
                                }
                        return varValue;
                      });
          }
        }

        return variant;
      }
    },
    date_first_available: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        return this.getDataValue('start_date') ? date.format(new Date(this.getDataValue('start_date')), 'ddd, MMM DD YYYY') : '';
      },
      set: function(value){
        
      },
    },
    date_end_available: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function(){
        return this.getDataValue('end_date') ? date.format(new Date(this.getDataValue('end_date')), 'ddd, MMM DD YYYY') : '';
      },
      set: function(value){
        
      },
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    bundle_deal: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      get: function() {
        const bundleDeal = this.getDataValue('bundle_deal');
        return bundleDeal ? bundleDeal : [];
      }
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    sequelize,
    tableName: 'products',
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "brand_id",
        using: "BTREE",
        fields: [
          { name: "brand_id" },
        ]
      },
      {
        name: "category_id",
        using: "BTREE",
        fields: [
          { name: "category_id" },
        ]
      },
      {
        name: "delivery_id",
        using: "BTREE",
        fields: [
          { name: "delivery_id" },
        ]
      },
    ]
  });
};

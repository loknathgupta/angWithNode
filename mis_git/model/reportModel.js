var db = require('./db');


var res= [];
var Report = {
    
    getMonthlyRevenue : function(condition,callback){
        var condi = '';
        var customCondi = '';
        if(condition.user_type=='PM'){
            condi += ` and PriceMaster.i_empid = '${condition.user_id}' `;
            customCondi += ` and CustomPriceMaster.i_empid = '${condition.user_id}' `;
        }
        if(condition.user_type=='GM'){
            condi += ` and PriceMaster.i_empid in( select id from user where manager_id = '${condition.user_id}') `;
            customCondi += ` and CustomPriceMaster.i_empid in( select id from user where manager_id = '${condition.user_id}') `;
        }
        if(condition.user_type=='AM'){
            condi += ` and PriceMaster.account_manager_id = '${condition.user_id}' `;
            customCondi += ` and CustomPriceMaster.account_manager_id = '${condition.user_id}' `;
        }
        if(condition.user_type=='AO'){
            condi += ` and PriceMaster.ao_id = '${condition.user_id}' `;
            customCondi += ` and PriceMaster.ao_id = '${condition.user_id}' `;
        }
        let extraSQL = extraSQLCustom = '';

        if(condition.includeLastMonthVolume == 1){    
            let explodedFrom = condition.from.split('-');
            
            if (explodedFrom[1] == 1) {
                prevMonth = 12;
                prevYear = explodedFrom[0] - 1;
            } else {
                prevMonth = explodedFrom[1] - 1;
                prevYear = explodedFrom[0];
            }
            // last month
            prevMonthStartDate = prevYear + '-' + prevMonth + '-' + '1';
            prevMonthLastDate = prevYear + '-' + prevMonth + '-' + '31';
            //console.log(prevMonthLastDate);
            //console.log(prevMonthStartDate);
           extraSQL =  `(select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${prevMonthStartDate}' and  '${prevMonthLastDate}'  group by DailyDeliverable.price_master_id  )as last_month_volume_actual,`; 
           extraSQLCustom =  `0 as last_month_volume_actual,`; 
        }
        //console.log(extraSQL);
        let query = `SELECT 
        PriceMaster.invoice_item,
        PriceMaster.id,
        PriceMaster.i_clientid,
        PriceMaster.price_per_unit,
        PriceMaster.price_unit,
        PriceMaster.currency,
        PriceMaster.price_type, 
        MonthlyVolumeSA.volume as volume_sa,
        MonthlyVolumeAM.volume as volume_am,
        MonthlyVolumePM.volume as volume_pm, 
        ${extraSQL}
        0 AS is_custom,
        (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${condition.from}' and  '${condition.to}'  group by DailyDeliverable.price_master_id  )as volume_actual, 
        (MonthlyVolumeSA.volume * PriceMaster.price_per_unit) as amount_sa, 
        (MonthlyVolumeAM.volume * PriceMaster.price_per_unit) as amount_am,
        (MonthlyVolumePM.volume * PriceMaster.price_per_unit) as amount_pm, 
        (select v_company from tbl_client Client where PriceMaster.i_clientid = Client.i_clientid) as client_name,
        (select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.i_empid = Employee.id) as pm_name,    
        (select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.account_manager_id = Employee.id) as am_name, 
        (select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.ao_id = Employee.id) as ao_name             
        FROM price_master as PriceMaster 
        left join monthly_volume as MonthlyVolumeSA on MonthlyVolumeSA.price_master_id = PriceMaster.id and MonthlyVolumeSA.month = '${condition.month}' and MonthlyVolumeSA.year = '${condition.year}' and MonthlyVolumeSA.user_type = 'A'
        left join monthly_volume as MonthlyVolumeAM on MonthlyVolumeAM.price_master_id = PriceMaster.id and MonthlyVolumeAM.month = '${condition.month}' and MonthlyVolumeAM.year = '${condition.year}'  and MonthlyVolumeAM.user_type = 'AM'
        left join monthly_volume as MonthlyVolumePM on MonthlyVolumePM.price_master_id = PriceMaster.id and MonthlyVolumePM.month = '${condition.month}' and MonthlyVolumePM.year = '${condition.year}'  and MonthlyVolumePM.user_type = 'PM'
        where 
        PriceMaster.client_status !='2' and PriceMaster.start_date <=  '${condition.to}' and PriceMaster.end_date >=  '${condition.from}' ${condi}`;


        let queryCustom = `SELECT 
        CONCAT(CustomPriceMaster.invoice_item, ' (Custom)') AS invoice_item,
        CustomPriceMaster.id,
        CustomPriceMaster.i_clientid,
        CustomPriceMaster.price_per_unit,
        CustomPriceMaster.price_unit,
        CustomPriceMaster.currency,
        'F' as price_type, 
        0 as volume_sa,
        0 as volume_am,
        0 as volume_pm, 
        ${extraSQLCustom}
        1 AS is_custom,
        CustomPriceMaster.volume as volume_actual, 
        0 as amount_sa, 
        0 as amount_am,
        0 as amount_pm, 
        (select v_company from tbl_client Client where PriceMaster.i_clientid = Client.i_clientid) as client_name,
        (select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.i_empid = Employee.id) as pm_name,    
        (select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.account_manager_id = Employee.id) as am_name, 
        (select concat(	first_name, ' ',last_name) from user Employee where PriceMaster.ao_id = Employee.id) as ao_name             
        FROM custom_price_master as CustomPriceMaster
        JOIN price_master PriceMaster ON(CustomPriceMaster.price_master_id = PriceMaster.id)
        WHERE 
        PriceMaster.client_status !='2' 
        AND CustomPriceMaster.status = 'A'
        AND CustomPriceMaster.start_date <=  '${condition.to}' 
        AND CustomPriceMaster.end_date >=  '${condition.from}' 
        ${customCondi} `;

        let revenueQuery = `${query} UNION ${queryCustom} ORDER BY id desc`;
        console.log(revenueQuery);

        return db.query(revenueQuery, callback);       
},
getInvoiceMonthDataAll : function(condition,callback){
    var condi = customCondition = '';
    if(condition.ids){
        condi = " AND PriceMaster.id in ("+condition.ids+")";
        customCondition = " AND CustomPriceMaster.id in ("+condition.ids+")";
    }

    condi += ` AND DailyDeliverable.delivery_date between '${condition.from}' AND  '${condition.to}'`;
    customCondition += ` AND CustomPriceMaster.start_date between '${condition.from}' AND  '${condition.to}'`;

    if(condition.invoicedStatus == 2){
        condi += ` AND (select group_concat(MonthlyInvoice.invoice_number)from monthly_invoice as MonthlyInvoice where MonthlyInvoice.price_master_id = PriceMaster.id and MonthlyInvoice.price_head_type = 'S' and    MonthlyInvoice.month = month(DailyDeliverable.delivery_date) and  MonthlyInvoice.year = year(DailyDeliverable.delivery_date) order by MonthlyInvoice.invoice_date) is NULL `;
        customCondition += ` AND (select group_concat(MonthlyInvoice.invoice_number)from monthly_invoice as MonthlyInvoice where MonthlyInvoice.price_master_id = CustomPriceMaster.id and MonthlyInvoice.price_head_type = 'C' and    MonthlyInvoice.month = month(CustomPriceMaster.start_date) and  MonthlyInvoice.year = year(CustomPriceMaster.start_date) order by MonthlyInvoice.invoice_date) is NULL `;
    }else if(condition.invoicedStatus == 1){
        condi += ` and (select group_concat(MonthlyInvoice.invoice_number) 
        from monthly_invoice as MonthlyInvoice 
        where MonthlyInvoice.price_master_id = PriceMaster.id 
        and MonthlyInvoice.price_head_type = 'S'
        and MonthlyInvoice.month = month(DailyDeliverable.delivery_date) 
        and  MonthlyInvoice.year = year(DailyDeliverable.delivery_date) 
        order by MonthlyInvoice.invoice_date) is NOT NULL `;

        customCondition += ` and (select group_concat(MonthlyInvoice.invoice_number) 
        from monthly_invoice as MonthlyInvoice 
        where MonthlyInvoice.price_master_id = CustomPriceMaster.id 
        and MonthlyInvoice.price_head_type = 'C'
        and MonthlyInvoice.month = month(CustomPriceMaster.start_date) 
        and  MonthlyInvoice.year = year(CustomPriceMaster.start_date) 
        order by MonthlyInvoice.invoice_date) is NOT NULL `;
    }


    let query = `SELECT distinct 
    PriceMaster.invoice_item,
    PriceMaster.id,
    PriceMaster.i_clientid,
    PriceMaster.price_per_unit,
    PriceMaster.price_unit,
    PriceMaster.currency,
    PriceMaster.price_type,
    PriceMaster.invoice_type,
    PriceMaster.invoice_to,
    PriceMaster.invoice_cc,
    0 as is_custom,
    
    (SELECT volume_sheet FROM monthly_volume_sheet WHERE price_master_id = PriceMaster.id AND month = month(DailyDeliverable.delivery_date) AND year = year(DailyDeliverable.delivery_date) LIMIT 1 ) as monthly_volume_sheet,
    (select group_concat(MonthlyInvoice.invoice_number)from monthly_invoice as MonthlyInvoice where MonthlyInvoice.price_master_id = PriceMaster.id and MonthlyInvoice.price_head_type = 'S' and    MonthlyInvoice.month = month(DailyDeliverable.delivery_date) and  MonthlyInvoice.year = year(DailyDeliverable.delivery_date) order by MonthlyInvoice.invoice_date) as invoice_number,
    (select group_concat(MonthlyInvoice.invoice_date)from monthly_invoice as MonthlyInvoice where MonthlyInvoice.price_master_id = PriceMaster.id and MonthlyInvoice.price_head_type = 'S' and    MonthlyInvoice.month = month(DailyDeliverable.delivery_date) and  MonthlyInvoice.year = year(DailyDeliverable.delivery_date) order by MonthlyInvoice.invoice_date) as invoice_date ,
    (select group_concat(MonthlyInvoice.full_partial)from monthly_invoice as MonthlyInvoice where MonthlyInvoice.price_master_id = PriceMaster.id and MonthlyInvoice.price_head_type = 'S' and    MonthlyInvoice.month = month(DailyDeliverable.delivery_date) and  MonthlyInvoice.year = year(DailyDeliverable.delivery_date) order by MonthlyInvoice.invoice_date) as full_partial , 
    SUM(DailyDeliverable.volume)  as volume,  
    month(DailyDeliverable.delivery_date)  as month, 
    year(DailyDeliverable.delivery_date)  as year,  
    (select v_company from tbl_client Client where PriceMaster.i_clientid = Client.i_clientid) as client_name, 
    (select concat(	first_name, ' ',last_name) from user User where PriceMaster.i_empid = User.id) as pm_name,  
    (select concat(	first_name, ' ',last_name) from user User where PriceMaster.account_manager_id = User.id) as am_name,
    (select concat(	first_name, ' ',last_name) from user User where PriceMaster.ao_id = User.id) as ao_name          
    FROM price_master as PriceMaster
    JOIN daily_deliverable DailyDeliverable  on DailyDeliverable.price_master_id = PriceMaster.id and month(DailyDeliverable.delivery_date) = '${condition.month}' and year(DailyDeliverable.delivery_date)='${condition.year}'
    
    WHERE  PriceMaster.client_status !='2' AND  DailyDeliverable.volume>0 ${condi}   
    GROUP BY DailyDeliverable.price_master_id, month(DailyDeliverable.delivery_date), year(DailyDeliverable.delivery_date)
    `;

    let customQuery = `SELECT distinct 
    CustomPriceMaster.invoice_item,
    CustomPriceMaster.id,
    CustomPriceMaster.i_clientid,
    CustomPriceMaster.price_per_unit,
    CustomPriceMaster.price_unit,
    CustomPriceMaster.currency,
    'F' As price_type,
    PriceMaster.invoice_type,
    PriceMaster.invoice_to,
    PriceMaster.invoice_cc,
    1 as is_custom,
    
    null as monthly_volume_sheet,
    (select group_concat(MonthlyInvoice.invoice_number)from monthly_invoice as MonthlyInvoice where MonthlyInvoice.price_master_id = CustomPriceMaster.id and MonthlyInvoice.price_head_type = 'C' and    MonthlyInvoice.month = month(CustomPriceMaster.start_date) and  MonthlyInvoice.year = year(CustomPriceMaster.start_date) order by MonthlyInvoice.invoice_date) as invoice_number,
    (select group_concat(MonthlyInvoice.invoice_date)from monthly_invoice as MonthlyInvoice where MonthlyInvoice.price_master_id = CustomPriceMaster.id and MonthlyInvoice.price_head_type = 'C' and    MonthlyInvoice.month = month(CustomPriceMaster.start_date) and  MonthlyInvoice.year = year(CustomPriceMaster.start_date) order by MonthlyInvoice.invoice_date) as invoice_date ,
    (select group_concat(MonthlyInvoice.full_partial)from monthly_invoice as MonthlyInvoice where MonthlyInvoice.price_master_id = CustomPriceMaster.id and MonthlyInvoice.price_head_type = 'C' and    MonthlyInvoice.month = month(CustomPriceMaster.start_date) and  MonthlyInvoice.year = year(CustomPriceMaster.start_date) order by MonthlyInvoice.invoice_date) as full_partial , 
    CustomPriceMaster.volume  as volume,  
    month(CustomPriceMaster.start_date )  as month, 
    year(CustomPriceMaster.start_date)  as year,  
    (select v_company from tbl_client Client where CustomPriceMaster.i_clientid = Client.i_clientid) as client_name, 
    (select concat(	first_name, ' ',last_name) from user User where CustomPriceMaster.i_empid = User.id) as pm_name,  
    (select concat(	first_name, ' ',last_name) from user User where CustomPriceMaster.account_manager_id = User.id) as am_name,
    (select concat(	first_name, ' ',last_name) from user User where CustomPriceMaster.ao_id = User.id) as ao_name          
    FROM custom_price_master as CustomPriceMaster
    JOIN price_master PriceMaster ON(CustomPriceMaster.price_master_id = PriceMaster.id)
    WHERE CustomPriceMaster.status='A' AND  PriceMaster.client_status !='2' AND volume > 0 ${customCondition} 
    `;
    query = query + ' UNION ' +customQuery;
    console.log(query);
    return db.query(query, callback);       
},
updateMonthLyInvoice: function(fieldsWithValues,id){
    return db.query(`UPDATE monthly_invoice SET ? WHERE id = '${id}'`, [fieldsWithValues ],callback);
},
insertMonthLyInvoice: function(saveArr,callback){
    return db.query(`INSERT INTO monthly_invoice (price_master_id, price_head_type, month,year,	invoice_number,invoice_date, full_partial,	created,modified,created_by,modified_by ) VALUES ?`, [saveArr], callback);
    
},
getMonthlyInvoice: function(condition, callback){
    let priceHeadType = 'S'; 
    let joinWithCustomPriceTable = '';
    let queryCondition =  `PriceMaster.id = '${condition.price_master_id}'`; 
    if(condition.isCustom == 1){
        priceHeadType = 'C'; 
        joinWithCustomPriceTable = ` JOIN custom_price_master CustomPriceMaster ON(PriceMaster.id = CustomPriceMaster.price_master_id)`
        queryCondition =  `CustomPriceMaster.id = '${condition.price_master_id}'`; 
    }
    let joinCondition = `
    MonthlyInvoice.price_master_id = '${condition.price_master_id}'
    AND month='${condition.month}'  
    AND year='${condition.year}' 
    AND price_head_type = '${priceHeadType}'`;

    let query = `select 
    MonthlyInvoice.*, 
    Client.v_company,
    PriceMaster.invoice_type  
    FROM price_master PriceMaster
    LEFT JOIN monthly_invoice as MonthlyInvoice ON(${joinCondition})
    JOIN tbl_client Client ON(Client.i_clientid = PriceMaster.i_clientid)
    ${joinWithCustomPriceTable}
    WHERE  ${queryCondition}`;
    console.log(query);
    return db.query(query,callback);
},
updateInvoiceNumber : function(postData,callback){
    var saveArr = []
    var updateQuery ='';
    if(postData.id.length>1){
        for(var i=0; i< postData.id.length ;i++){
          var invoiceNumber = postData.invoice_number[i];
          var invoiceDate = postData.invoice_date[i];
          var fullPartial = postData.full_partial[i];
          //console.log(postData[invoiceNumber]);
         // console.log(fullPartial);
         
         
            let invDateArr = invoiceDate.split("-");
            let invDateF = invDateArr[2]+'-'+invDateArr[1]+'-'+invDateArr[0];
           
             
                updateQuery += " update monthly_invoice set invoice_number='"+ invoiceNumber+"', invoice_date = '"+invDateF+"', full_partial='"+fullPartial+"', modified='"+postData.modified+"', modified_by = '"+postData.modified_by+"' where id ='"+postData.id[i]+"'; ";
              
              
          
        }
    }else{
        let invDateArr = postData.invoice_date.split("-");
        let invDateF = invDateArr[2]+'-'+invDateArr[1]+'-'+invDateArr[0];
        updateQuery += " update monthly_invoice set invoice_number='"+ postData.invoice_number+"', invoice_date = '"+invDateF+"', full_partial='"+postData.full_partial+"', modified='"+postData.modified+"', modified_by = '"+postData.modified_by+"' where id ='"+postData.id+"'; ";
    }
   // console.log(saveArr);
   // console.log(updateQuery);
    if( updateQuery!=''){
        return db.query(updateQuery,callback);
    }else{
        callback();
    }
    
    
    
},
addInvoiceNumber : function(condition,postData,callback){
    var saveArr =[];
    for(var i=0;i<postData.ids.length;i++){
        let invDateArr = postData.invoice_date.split("-");
            let invDateF = invDateArr[2]+'-'+invDateArr[1]+'-'+invDateArr[0];
        
        var dataArr = [postData.ids[i], postData.customOrStandardStatus[i], postData.month, postData.year,postData.invoice_number,invDateF,postData.full_partial, postData.created,postData.modified ,postData.created_by,postData.modified_by];
        saveArr.push(dataArr);
    }
    if(saveArr.length>0 ){
        Report.insertMonthLyInvoice(saveArr,callback);
    }else{
        callback();
    }
},
getInvoiceDataForClient : function(condition,callback){
    let query = `SELECT 
    PriceMaster.invoice_item,
    PriceMaster.id, 
    PriceMaster.i_clientid,
    PriceMaster.price_per_unit, 
    PriceMaster.price_unit, 
    PriceMaster.currency, 
    PriceMaster.price_type,
    0 as is_custom, 
     
    
    (select sum(CustomPriceMaster.volume*CustomPriceMaster.price_per_unit) as custom_amt  from custom_price_master as CustomPriceMaster where CustomPriceMaster.price_master_id = PriceMaster.id  and CustomPriceMaster.status='A' 
    AND CustomPriceMaster.start_date <=  '${condition.fifth_last_month_to}' And CustomPriceMaster.end_date >=  '${condition.fifth_last_month_from}'  group by CustomPriceMaster.price_master_id  )as fifth_last_month_custom_amt, 

    (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${condition.fifth_last_month_from}' and  '${condition.fifth_last_month_to}'  group by DailyDeliverable.price_master_id  )as fifth_last_month_volume,

    (select sum(CustomPriceMaster.volume*CustomPriceMaster.price_per_unit) as custom_amt  from custom_price_master as CustomPriceMaster where CustomPriceMaster.price_master_id = PriceMaster.id  and CustomPriceMaster.status='A' 
    AND CustomPriceMaster.start_date <=  '${condition.fourth_last_month_to}' And CustomPriceMaster.end_date >=  '${condition.fourth_last_month_from}'  group by CustomPriceMaster.price_master_id  )as fourth_last_month_custom_amt, 

    (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${condition.fourth_last_month_from}' and  '${condition.fourth_last_month_to}'  group by DailyDeliverable.price_master_id  )as fourth_last_month_volume,

    (select sum(CustomPriceMaster.volume*CustomPriceMaster.price_per_unit) as custom_amt  from custom_price_master as CustomPriceMaster where CustomPriceMaster.price_master_id = PriceMaster.id  and CustomPriceMaster.status='A' 
    AND CustomPriceMaster.start_date <=  '${condition.third_last_month_to}' And CustomPriceMaster.end_date >=  '${condition.third_last_month_from}'  group by CustomPriceMaster.price_master_id  )as third_last_month_custom_amt, 

    (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${condition.third_last_month_from}' and  '${condition.third_last_month_to}'  group by DailyDeliverable.price_master_id  )as third_last_month_volume,
    
    
    (select sum(CustomPriceMaster.volume*CustomPriceMaster.price_per_unit) as custom_amt  from custom_price_master as CustomPriceMaster where CustomPriceMaster.price_master_id = PriceMaster.id  and CustomPriceMaster.status='A' 
    AND CustomPriceMaster.start_date <=  '${condition.second_last_month_to}' And CustomPriceMaster.end_date >=  '${condition.second_last_month_from}'  group by CustomPriceMaster.price_master_id  )as second_last_month_custom_amt, 

    (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${condition.second_last_month_from}' and  '${condition.second_last_month_to}'  group by DailyDeliverable.price_master_id  )as second_last_month_volume,  

    (select sum(CustomPriceMaster.volume*CustomPriceMaster.price_per_unit)as custom_amt  from custom_price_master as CustomPriceMaster where CustomPriceMaster.price_master_id = PriceMaster.id  and CustomPriceMaster.status='A' 
    AND CustomPriceMaster.start_date <=  '${condition.last_month_to}' And CustomPriceMaster.end_date >=  '${condition.last_month_from}'  group by CustomPriceMaster.price_master_id  )as last_month_custom_amt, 
    
    (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${condition.last_month_from}' and  '${condition.last_month_to}'  group by DailyDeliverable.price_master_id  )as last_month_volume,   
    (select sum(DailyDeliverable.volume)  from daily_deliverable as DailyDeliverable where DailyDeliverable.price_master_id = PriceMaster.id  and DailyDeliverable.delivery_date between '${condition.from}' and  '${condition.to}'  group by DailyDeliverable.price_master_id  )as volume,  
    
    
    (select v_company from tbl_client Client where PriceMaster.i_clientid = Client.i_clientid) as client_name  
            
    FROM price_master as PriceMaster
    WHERE  PriceMaster.client_status !='2' 
    AND PriceMaster.start_date <=  '${condition.to}' 
    AND PriceMaster.end_date >=  '${condition.second_last_month_from}'`;

    let customPriceQuery = `SELECT 
    CustomPriceMaster.invoice_item,
    CustomPriceMaster.id, 
    CustomPriceMaster.i_clientid,
    CustomPriceMaster.price_per_unit, 
    CustomPriceMaster.price_unit, 
    CustomPriceMaster.currency, 
    'F' as price_type,
    1 as is_custom, 
    0 as fifth_last_month_custom_amt,
    0 as fifth_last_month_volume,
    0 as fourth_last_month_custom_amt,
    0 as fourth_last_month_volume,
    0 as third_last_month_custom_amt,
    0 as third_last_month_volume,
    0 as second_last_month_custom_amt,
    0 as second_last_month_volume,
    0 as last_month_custom_amt,
    0 as last_month_volume,   
    CustomPriceMaster.volume as volume, 
    

    (select v_company from tbl_client Client where CustomPriceMaster.i_clientid = Client.i_clientid) as client_name 
   
    FROM custom_price_master as CustomPriceMaster
    JOIN price_master PriceMaster ON(CustomPriceMaster.price_master_id = PriceMaster.id)
    Where  CustomPriceMaster.status='A' 
    AND PriceMaster.client_status !='2' 
    AND CustomPriceMaster.start_date <=  '${condition.to}' 
    And CustomPriceMaster.end_date >=  '${condition.from}'`;

    query = query + ' UNION ' +customPriceQuery;

    return db.query(query, callback);       
},
getInvoiceDataForClientDays : function(condition,callback){
    let query = `SELECT 
    PriceMaster.invoice_item,
    PriceMaster.id, 
    PriceMaster.i_clientid,
    PriceMaster.price_per_unit, 
    PriceMaster.price_unit, 
    PriceMaster.currency, 
    PriceMaster.price_type,
    0 as is_custom, 
    sum(DailyDeliverable.volume) as volume,
    DailyDeliverable.delivery_date as d_date,
     (select v_company from tbl_client Client where PriceMaster.i_clientid = Client.i_clientid) as client_name  
            
    FROM price_master as PriceMaster
    left join daily_deliverable as DailyDeliverable on DailyDeliverable.price_master_id = PriceMaster.id
    WHERE  PriceMaster.client_status !='2' 
    and DailyDeliverable.delivery_date between '${condition.from}' and  '${condition.to}'
    group by DailyDeliverable.delivery_date,DailyDeliverable.price_master_id`;

    let customPriceQuery = `SELECT 
    CustomPriceMaster.invoice_item,
    CustomPriceMaster.id, 
    CustomPriceMaster.i_clientid,
    CustomPriceMaster.price_per_unit, 
    CustomPriceMaster.price_unit, 
    CustomPriceMaster.currency, 
    'F' as price_type,
    1 as is_custom, 
    
    CustomPriceMaster.volume as volume, 
    DATE(CustomPriceMaster.start_date)as d_date,
    

    (select v_company from tbl_client Client where CustomPriceMaster.i_clientid = Client.i_clientid) as client_name 
   
    FROM custom_price_master as CustomPriceMaster
    JOIN price_master PriceMaster ON(CustomPriceMaster.price_master_id = PriceMaster.id)
    Where  CustomPriceMaster.status='A' 
    AND PriceMaster.client_status !='2' 
    AND date(CustomPriceMaster.start_date) between '${condition.from}' and  '${condition.to}' 
    
    group by date(CustomPriceMaster.start_date),CustomPriceMaster.price_master_id
    `;

    query = query + ' UNION ' +customPriceQuery;

    return db.query(query, callback);       
}




};
module.exports = Report;
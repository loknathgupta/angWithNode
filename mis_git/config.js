configuration = {
    'billingCycle':{'M':'Monthly','Q':'Quarterly','Y':'Yearly'},
    UserStatus: {'A':'Active', 'I':'InActive', 'L': 'On Leave', 'R': 'Resigned', 'S': 'Suspended'},
    InvoiceType:{'1':'Invoice','2':'Proforma', '3': 'Details'},
    ClientStatus:{'1':'Active','2':'Blacklisted'},
    PricingHeadStatus:{'A':'Active','I':'InActive'},
    FullPartial: {'Full':'Full','Partial':'Partial'},
    PriceType : {'S' : 'Slab Based', 'F': 'Fixed Per Unit'},
    ApprovalStatus : {'N': 'No', 'Y' : 'Yes'},
    host : '',
    getSlabAmount: function getSlabAmount(slab_price, volume) {
        var rest = 0;
        var amt = 0;
        volume = volume*1;
        // console.log("Volume = "+volume);
        var pid;
        if (slab_price && volume > 0) {
            slab_price.forEach(function (row) {
                rest = 0;
                if (row.volume_to != null && row.volume_to > 0 ) {
                    pid = row.price_master_id;
                    var vol = (row.volume_to - row.volume_from) + 1;
    
                    if(volume > vol){
                        rest = volume - vol
                    }
    
                    if (rest > 0 ) {
                        // console.log(row.price +" A "+ vol);
                        amt += row.price * vol;
                    } else {
                        // console.log(row.price +" B "+ volume);
                        amt += row.price * volume;
                    }
                }
                else if (row.volume_to == null) {
                    // console.log(row.price +" C "+ volume);
                    amt += row.price * volume;
                }
                // alert(rest);
                volume = rest;
    
            });
        }
        // console.log(pid+"="+amt, );
        amt = parseFloat(amt).toFixed(2);
        return amt;
    },
    onlyUnique:function (value, index, self) {
        return self.indexOf(value) === index;
    }
  
}
module.exports = configuration;
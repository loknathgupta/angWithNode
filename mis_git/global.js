var Globals = function() {
  this.name = 'test';
  this.canTalk = function(){
    return 'Hello';
  };
};

module.exports = Globals;
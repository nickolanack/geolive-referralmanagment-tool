ProjectTeam.CurrentTeam().getDevices(function(devices){
    callback(devices.filter(function(d){
        return d.isActivated();
    }))
});
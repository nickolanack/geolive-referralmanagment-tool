
console.log('quick dark mode');

if(window.DashboardConfig){
    DashboardConfig.getValues(['darkMode', 'pageClassNames'],function(values){
        if(window.DisplayTheme){
            DisplayTheme.setDefaults(values, list.content[0]);
        }
    });
}

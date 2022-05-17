var cats= UserGroups.GetSubgroups();
if(cats.length==0){
    cats.push("placeholder");
}
return cats;
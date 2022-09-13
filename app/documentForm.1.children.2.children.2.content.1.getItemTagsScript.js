var cats= Proposal.ListTerritories();
if(cats.length==0){
    cats.push("placeholder");
}
 cats.sort(function(a, b){ return a.localeCompare(b); })
 
return cats;
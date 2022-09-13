var cats= Proposal.ListTerritories();
if(cats.length==0){
    cats.push("placeholder");
}
return cats.sort(function(a, b){ return a.localeCompare(b); })
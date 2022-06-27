
            callback((item.getParameters?item.getParameters():[]).map(function(item){
                return new MockDataTypeItem({
                    name:item.name,
                    description:item.description,
                    fieldType:item.fieldType,
                    defaultValue:item.defaultValue
                });
                
            }));

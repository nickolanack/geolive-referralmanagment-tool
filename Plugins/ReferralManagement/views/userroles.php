<?php
behavior('ajax');
IncludeJSBlock('


	var setBooleanAttribute=function(id, key, value){


		var me=this;
		var checked=me.checked;


		if(checked){

		}

		var values={};
		values[key]=value;


		var query=new AjaxControlQuery(CoreAjaxUrlRoot, "save_attribute_value_list", {
				plugin:"Attributes", 
				itemId:id, 
				itemType:"user",
				table:"userAttributes", 
				fieldValues:values
			});


			query.execute();

	}



');

IncludeCSSBlock('

span.user-name {
    font-size: 20px;
    color: cornflowerblue;
}


');

HtmlBlock('page', 
    array(
        
        'title' => 'Users',
        'content' => function () {
            Core::Widgets();
            $selectionManager = 'SelectedWidget';
            
            Scaffold('lists.generic.selectablelist', 
                
                array(
                    
                   // 'listTitle' => 'Active Widgets',
                    'list' => Core::Client()->listUsers(),
  
                    'maxSelections' => 1,
                    'emptyMessage' => 'There are no users.',
                    
                    'selectableCallback' => function ($user, $params) {

                    	GetPlugin('Attributes');
                    	$userAttributes=(new attributes\Record('userAttributes'))->getValues($user['id'], 'user');

                    
                		?>
                		<div>

                			<span class="user-id" data-user-id="<?php echo $user['id']; ?>"></span>
                			<span class="user-name"><?php echo $user['name']; ?></span>
                			<span class="user-email"><?php echo $user['email']; ?></span>
                			<span class="user-roles">
                				
                			<?php 
                			 foreach(array_keys($userAttributes) as $key){
                			 	if(strpos($key, 'is')===0){
                			 		$value=$userAttributes[$key];
                			 		if($value==="false"){
                			 			$value=false;
                			 		}
                			 		$value=!!$value;
                			 		?>
                			 		<label><?php echo $key; ?> <input type="checkbox" <?php echo $value?"checked":""; ?> 
                			 		onchange="setBooleanAttribute(<?php echo $user['id'];?>, '<?php echo $key?>', this.checked);" 
                			 		></label> 

                			 		<?php
                			 	}
                			 }

                			?>
                			</span>
               
                		</div>
                		<?php
                    }
                ));
        }
    ));
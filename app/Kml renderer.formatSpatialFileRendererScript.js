Broadcast('kmlRender', 'format', $args);

if(isset($args->options)&&isset($args->options->showAttributes)&&$args->options->showAttributes==true){
    $transcoder->includeAttributes();
}
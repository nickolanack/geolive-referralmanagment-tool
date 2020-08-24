



var recent= <?php 

 $posts=($plugin=GetPlugin('Discussions'))->getPostsForItem(145, 'widget', 'wabun');
 echo json_encode($posts, JSON_PRETTY_PRINT);


?>;



RecentItems.RecentUserActivity.setListData(recent.reverse(),'.user');

return RecentItems.RecentUserActivity;
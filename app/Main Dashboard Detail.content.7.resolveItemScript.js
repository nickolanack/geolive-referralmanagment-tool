

var recent= <?php 

 $posts=($plugin=GetPlugin('Discussions'))->getPostsForItem(145, 'widget', 'wabun');
 echo json_encode($posts, JSON_PRETTY_PRINT);


?>;
RecentItems.RecentActivity.setListData(recent.reverse(),'.proposal');
return RecentItems.RecentActivity;
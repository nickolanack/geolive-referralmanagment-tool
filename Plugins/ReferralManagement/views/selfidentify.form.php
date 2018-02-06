<?php
IncludeCSSBlock($this->getParameter('customFormCss', ''));

?><style>
ul {
	list-style: none;
	display: inline-block;
	white-space: nowrap;
}

span {
	
}

li {
	display: inline-block;
	width: 150px;
	height: 150px;
	border: 1px solid #CCCCCC;
	border-radius: 100%;
	margin: 7px;
	margin-top: 50px;
	position: relative;
	cursor: pointer;
}

li>span {
	width: 100%;
	text-align: center;
	display: inline-block;
	bottom: -26px;
	position: absolute;
	color: steelblue;
	font-size: 13px;
	font-weight: 100;
}

h3 {
	
}

li:hover {
	background-color: aliceblue;
}
</style>
<p>
<h3>Are you a member of a special user group</h3>

<ul>
	<li><span> Proponent </span></li>
	<li><span> Community Member </span></li>

	<li><span> Lands Department Member </span></li>
</ul>
</p>
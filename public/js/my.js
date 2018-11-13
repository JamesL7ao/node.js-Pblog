$('.menu img').click(function(event) {
	$('.menu ul').slideToggle(100);
});

$('#username').blur(function(){
	if($('#username').val()==''){
		$('.user').html('请输入正确用户名');
		$('.user').css('color', 'red');
	}else{
		$('.user').css('display', 'none');
	}
})
$('#password').blur(function(){
	if($('#password').val()==''){
		$('.pass').html('请输入正确密码');
		$('.pass').css('color', 'red');
	}else{
		$('.pass').css('display', 'none');
	}
})

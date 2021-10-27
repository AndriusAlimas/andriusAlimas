$(window).on('load',  () =>{
    if ($('.loading-area').length) {
        $('.loading-area').delay(1000).fadeOut('slow', function () {
        $(this).hide();
        $('nav, main').css('opacity',1);
   });
  }
})

// when all html loaded execute this function
$(document).ready(()=>{
});
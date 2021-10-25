$(window).on('load', function () {
    if ($('.loading-area').length) {
    $('.loading-area').delay(1000).fadeOut('slow', function () {
    $(this).remove();
   });
  }
})
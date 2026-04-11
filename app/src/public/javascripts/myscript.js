/* Star Rating Widget
   Works on any container with class "star-interactive"
   Stars need data-index="1..5", sibling hidden input gets the value.
   Neon color class: vr-star, Alt color: vr-star-purple
*/
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.star-interactive').forEach(function (group) {
    var stars = group.querySelectorAll('i[data-index]');
    var hiddenInput = group.querySelector('input[type="hidden"]');
    var isAlt = group.id.toLowerCase().indexOf('intensity') !== -1;
    var filledClass = isAlt ? 'vr-star-purple' : 'vr-star';
    var selected = hiddenInput && hiddenInput.value ? parseInt(hiddenInput.value) : 0;

    function render(val) {
      stars.forEach(function (star) {
        var idx = parseInt(star.dataset.index);
        if (idx <= val) {
          star.className = 'bi bi-star-fill ' + filledClass;
        } else {
          star.className = 'bi bi-star vr-star-muted';
        }
      });
    }

    // Initial render for edit pages with pre-filled values
    if (selected > 0) render(selected);

    stars.forEach(function (star) {
      star.addEventListener('click', function () {
        selected = parseInt(star.dataset.index);
        if (hiddenInput) hiddenInput.value = selected;
        render(selected);
      });

      star.addEventListener('mouseenter', function () {
        render(parseInt(star.dataset.index));
      });
    });

    group.addEventListener('mouseleave', function () {
      render(selected);
    });
  });
});

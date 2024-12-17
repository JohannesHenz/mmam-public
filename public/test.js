const AJAX_RETRY_COUNT = 3;
const AJAX_RETRY_DELAY = 0;

$(document).ready(function () {
  main();
});

function main() {
  testCall(AJAX_RETRY_COUNT);
  setTimeout(main, 2000);
}

function testCall(retries) {
  $.ajax({
    url: "https://localhost:443/test",
    type: "GET",
    dataType: "json",
    success: function (data, status, xhr) {
      console.log(data);
      renderTest(data);
    },
    error: function (xhr, status, error) {
      if (retries > 1) {
        setTimeout(function () {
          testCall(retries - 1);
        }, AJAX_RETRY_DELAY);
      } else {
        console.log(
          `failed to GET http://localhost:443/test in ${AJAX_RETRY_COUNT} tries`
        );
        renderTest([]);
      }
    },
  });
}

function renderTest(data) {
  $("#test").empty();
  if (data.length === 0) {
    $("#test").append("<p>No data</p>");
    return;
  }
  const table = $("<table></table>");
  const headerRow = $("<tr></tr>");
  Object.keys(data[0]).forEach((key) => {
    headerRow.append($(`<th>${key.toLocaleUpperCase()}</th>`));
  });
  table.append(headerRow);
  for (let i = 0; i < data.length; i++) {
    const row = $("<tr></tr>");
    Object.values(data[i]).forEach((value) => {
      row.append($(`<td>${value}</td>`));
    });
    table.append(row);
  }
  $("#test").append(table);
}

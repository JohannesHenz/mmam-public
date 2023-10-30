const AJAX_RETRY_COUNT = 3;
const AJAX_RETRY_DELAY = 0;

$(document).ready(function () {
    main();
});

function main() {
    testCall(AJAX_RETRY_COUNT);
    setTimeout(main, 1000);
}

function testCall(retries) {
    $.ajax({
        url: 'http://localhost:3313/test',
        type: 'GET',
        dataType: 'json',
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
                console.log(`failed to GET http://localhost:3313/test in ${AJAX_RETRY_COUNT} tries`);
                renderTest([])
            }
        }
    });
}

function renderTest(data) {
    $('#test').empty();
    if (data.length === 0) {
        data = [{id: "N/A", name: "N/A"}]
    }
    const table = $('<table></table>');
    const headerRow = $('<tr></tr>');
    headerRow.append('<th>ID</th>');
    headerRow.append('<th>Name</th>');
    table.append(headerRow);
    for (let i = 0; i < data.length; i++) {
        table.append($(`<tr><td>${data[i].id}</td><td>${data[i].name}</td></tr>`));
    }
    $('#test').append(table);
}
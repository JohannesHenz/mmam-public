const AJAX_RETRY_COUNT = 3;
const AJAX_RETRY_DELAY = 0;

$(document).ready(function () {
    main();
});

function main() {
    leafletMap();
    testCall(AJAX_RETRY_COUNT);
}

function leafletMap() {
    var map = L.map('map').setView([48.23944, 16.37725], 16);

    var fhtw_a = L.polygon([
        [48.23968014973927, 16.377557638755537],
        [48.23975964421803, 16.3777293001179],
        [48.23896999652263, 16.37855238977832],
        [48.23888971980559, 16.378379387311565]
    ], {color: 'magenta'}).addTo(map);

    var fhtw_b = L.polygon([
        [48.23888971980559, 16.378379387311565],
        [48.238999249409844, 16.3786154115551],
        [48.23869803456504, 16.378930595601197],
        [48.23861548717266, 16.378752483791086],
        [48.23873684819077, 16.378626902647717],
        [48.23870951465327, 16.378566984847286]
    ], {color: 'yellow'}).addTo(map);

    var fhtw_c = L.polygon([
        [48.24009558567578, 16.37771300968776],
        [48.2401338515874, 16.37771547206312],
        [48.240185237195156, 16.377740916608506],
        [48.240228422931956, 16.37777538986355],
        [48.24033666044262, 16.377891121510952],
        [48.240420845013716, 16.37799043731714],
        [48.240394605681765, 16.378060204619015],
        [48.240394059028866, 16.378060204619015],
        [48.240433964674665, 16.37809878183299],
        [48.24039023245844, 16.37822354218457],
        [48.24023060955196, 16.37814885013198],
        [48.24015189122291, 16.3780979610412],
        [48.24010433217376, 16.37805692145187],
        [48.24007317277275, 16.377985512566426],
        [48.24005622642389, 16.37789850863703],
        [48.24005513311086, 16.37783120371052],
        [48.24006551958363, 16.37776882353473],
    ], {color: 'grey'}).addTo(map);

    var fhtw_e = L.polygon([
        [48.2695813155351, 16.426756509977235],
        [48.26975092348288, 16.426790708139265],
        [48.269631375906215, 16.428121731594278],
        [48.26946042854613, 16.42808619232785],
    ], {color: 'green'}).addTo(map);

    var fhtw_f = L.polygon([
        [48.239667636769596, 16.376755605862577],
        [48.239752490442996, 16.376925926120546],
        [48.238887828025916, 16.377917545686255],
        [48.23880252631063, 16.377725767751212]
    ], {color: 'cyan'}).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 100,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.removeControl(map.zoomControl);
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
            if (retries > 0) {
                setTimeout(function () {
                    testCall(retries - 1);
                }, AJAX_RETRY_DELAY);
            } else {
                console.log(`failed to GET http://localhost:3313/test in ${AJAX_RETRY_COUNT} tries`);
            }
        }
    });
}

function renderTest(data) {
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
// This is to test the object property
//

var empty={};
var person_a={
  "first-name": "Joe",
  "last-name": "Kevin"
};

var flight = {
  airline: "Delta",
  flight_no: 885,
  departure: {
    from: "Chicago",
    time: "9:30AM"
  }
};

document.writeln("Hello World!");
document.writeln(person_a['first-name'] + ' ' + person_a['last-name']);
document.writeln(flight.airline + ' ' + flight.flight_no);
document.writeln(flight.departure.from + ' ' + flight.departure.time);
document.writeln("Hello World!");



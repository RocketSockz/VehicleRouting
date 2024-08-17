import { createInterface } from "readline";
import { createReadStream } from "fs";

/**
 * Parses a problem file given a path. 
 * Returns the problem file as an Object.
 * @param {string} path - Path to the problem file 
 */
async function parseProblemFile(path) {
  const returnPromise = new Promise((resolve, reject) => {
    // Bunch of code here assumes no problems will ever be run into
    const fileReadStream = createReadStream(path);
    const lineReader = createInterface({
      input: fileReadStream
    });
    let lineNumber = 0;
    let loads = [];
    lineReader.on('line', (line) => {
      if (lineNumber === 0) {
        // We do nothing now - we used to log.
      } else {
        const parsedLoad = parseLine(line);
        loads.push(parsedLoad);
      }
      lineNumber++;
    });
    lineReader.on('close', () => {
      resolve(loads);
    });
  });
  return returnPromise;
}

class Point {
  static origin = new Point(0, 0);
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  distanceToPoint(point) {
    // Usually I would just do the full math equations
    // Math.sqrt(Math.pow((returnObject.end.x - returnObject.start.x), 2) + Math.pow((returnObject.end.y - returnObject.start.y), 2));
    // But since we are trying to make this fast - we use Math.hypot instead.

    // The calculate goes 2nd x - 1st x, 2nd y - 1st y
    return Math.hypot((point.x - this.x), (point.y - this.y));
  }
}

class Route {
  static depotOrigin = Point.origin;
  constructor(loads) {
    // A route is basically just the stops we need to do (loads), and the points to go.
    // An array of Load objects
    this.loads = loads;
    // Get the distance between the depot origin and the first load starting point.
    this.homeDistance = depotOrigin.distanceToPoint(this.firstLoad.start);
    // Get the distance between the last load and the depot origin. That way our driver can go home.
    this.finalPoint.origin.distanceToPoint(this.lastLoad.end);
  }

  calculateRouteDistance() {
    // Get the distance between the depot origin and the first load starting point.
    this.homeDistance = this.depotOrigin.distanceToPoint(this.firstLoad.start);
    // Get the distance between the last load and the depot origin. That way our driver can go home.
    this.finalPoint.origin.distanceToPoint(this.lastLoad.end);
  }
  get firstLoad() {
    return this.loads.length !== 0 ? this.loads[0] : undefined;
  }
  get lastLoad() {
    return this.loads.length !== 0 ? this.loads[this.loads.length - 1] : undefined;
  }
}
class Load { 
  constructor(loadNumber, startPoint, endPoint) {
    this.loadNumber = loadNumber;
    // These are assumed to be point Objects from the class
    this.start = startPoint;
    this.end = endPoint;
    // We just call the other classes function.
    this.distance = this.start.distanceToPoint(this.end);
  }
}

function parseLine(lineString) {
  // Lots of stuff - this parses the line into an object.
  const parseMyLineRegex = /(\d+)\s+\(([^,]+),([^)]+)\)\s+\(([^,]+),([^)]+)\)/;
  const match = lineString.match(parseMyLineRegex);
  const start = new Point(Number(match[2]), Number(match[3]));
  const end = new Point(Number(match[4]), Number(match[5]));
  const loadParsed = new Load(Number(match[1]), start, end);
  return loadParsed;
}

// We are using top-level await here. 
// That might not work depending on the version of Node.js the user uses.
const loads = await parseProblemFile("./problems/1.txt");
console.error("My loads", loads);
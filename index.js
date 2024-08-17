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
  static distanceBetweenPoints(point1, point2) {
  // Turns out - Math.hypot is slower then just doing the calculation ourselves.
  // return Math.hypot((point2.x - point1.x), (point2.y - point1.y));
  return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
  }
}

/**
 * Route class - which is pretty much just an array of loads.
 */
class Route {
  static depotOrigin = Point.origin;
  constructor(loads) {
    // A route is basically just the stops we need to do (loads), and the points to go.
    // An array of Load objects
    this.loads = loads;
  }

  /**
   * Getter for calculating the total distance of the route.
   * @returns The total distance of the route, with home stops included.
   */
  get totalDistance() {
    let currentPosition = Point.origin;
    let totalDistance = 0;
    
    for (const currentLoad of this.loads) {
        totalDistance += Point.distanceBetweenPoints(currentPosition, currentLoad.start)
        currentPosition = currentLoad.start
        totalDistance += Point.distanceBetweenPoints(currentPosition, currentLoad.end)
        currentPosition = currentLoad.end
      }
      totalDistance += Point.distanceBetweenPoints(currentPosition, Point.origin)
      return totalDistance;
  }
}
/**
 * Load class - represents a load to be delivered
 */
class Load { 
  constructor(loadNumber, startPoint, endPoint) {
    this.loadNumber = loadNumber;
    // These are assumed to be point Objects from the class
    this.start = startPoint;
    this.end = endPoint;
    this.isAssigned = false;
  }
}

/**
 * Central function to calculate the potential distance of a new load, if added to a route
 * @param {Array<Load>} loadArray existing load array
 * @param {Load} newLoad load to add
 * @returns returns the total distance of the route if the new load is added.
 */
function calculatePotentialDistance(loadArray, newLoad) {
  if (loadArray.length === 0) {
    const fakeRoute = new Route([newLoad]);
    return fakeRoute.totalDistance;
  } else {
    const fakeRoute = new Route([...loadArray, newLoad]);
    return fakeRoute.totalDistance;
  }
}

/**
 * Creates and assigns drivers based on loads 
 * Will add a new driver if existing drivers cannot take on a load
 * @param {Array<Load>} loads - An array of Load objects
 * @returns An array of drivers, each with an array of loads.
 */
function assignDrivers(loads) {
  // Start with no drivers
  const drivers = [{ loads:[] }];
  // iterate over each load
  for (const load of loads) {
    for (const driver of drivers) {
      const potentialNewDistance = calculatePotentialDistance(driver.loads, load);
      if (potentialNewDistance <= 720 && !load.isAssigned) { 
        load.isAssigned = true;
        driver.loads.push(load);
        // We want to leave the loop if we assign a load.
        break;
      } 
    }
    // If we haven't assigned the load and went thru all of our drivers, we need to create a new driver.
    if (!load.isAssigned) {
      load.isAssigned = true;
      const newDriver = { loads: [load] };
      drivers.push(newDriver);
    }
  }
  return drivers;
}

/**
 * Creates and assigns drivers based on loads 
 * This uses the nearest neighbor algorithm to assign drivers.
 * @param {Array<Load>} loads - An array of Load objects
 * @returns An array of drivers, each with an array of loads.
 */
function assignDriversNearestNeighbor(loads) {
  // We start with no drivers
  const drivers = [];

  // I want to iterate, until all the loads are assigned
  while (loads.some(load => !load.isAssigned)) {
    const driver = { loads: [] };
    // We start at the depot / origin
    let currentPosition = Point.origin;
    let driverTimeLimit = 12*60; // 12 hours in minutes

    // While the driver has time left.
    while (driverTimeLimit > 0) {
      let nearestLoad;
      // Lets just big number this
      let nearestDistance = 99999;

      for (const load of loads) {
        // If we aren't assigned
        if (!load.isAssigned) {
          const distanceForPickup = Point.distanceBetweenPoints(currentPosition, load.start);
          const totalDistanceForLoad = distanceForPickup +
              Point.distanceBetweenPoints(load.start, load.end) +
              Point.distanceBetweenPoints(load.end, Point.origin);
          // We start trying to find our closest load
          // We don't even try to match the load with a driver, if the driver can't make it home from the load.
          if (totalDistanceForLoad <= driverTimeLimit && distanceForPickup < nearestDistance) {
            nearestDistance = distanceForPickup;
            nearestLoad = load;
          }
        }
      }

      if (nearestLoad) {
        driver.loads.push(nearestLoad);
        nearestLoad.isAssigned = true;

        driverTimeLimit -= nearestDistance + Point.distanceBetweenPoints(nearestLoad.start, nearestLoad.end);
        currentPosition = nearestLoad.end;
      } else {
        // No more loads can be assigned to this driver
        break;
      }
    }

    // Add the driver to the list of drivers
    drivers.push(driver);
  }

  return drivers;
}

/**
 * Parses a line from a VRP problem file
 * @param {string} lineString a string - assuming to be points and load information
 * @returns A new load object
 */
function parseLine(lineString) {
  // Lots of stuff - this parses the line into an object.
  const parseMyLineRegex = /(\d+)\s+\(([^,]+),([^)]+)\)\s+\(([^,]+),([^)]+)\)/;
  const match = lineString.match(parseMyLineRegex);
  const start = new Point(Number(match[2]), Number(match[3]));
  const end = new Point(Number(match[4]), Number(match[5]));
  const loadParsed = new Load(Number(match[1]), start, end);
  return loadParsed;
}

// Parse them args
const args = process.argv.slice(2);
const filePath = args[0];
// We are using top-level await here. 
// That might not work depending on the version of Node.js the user uses.
const loads = await parseProblemFile(filePath);
// Well now we have our list, lets get it printed.
// const drivers = assignDrivers(loads);
const drivers = assignDriversNearestNeighbor(loads);
for (const driver of drivers) {
  const loadIds = driver.loads.map(load => load.loadNumber).join(",");
  console.log(`[${loadIds}]`);
}

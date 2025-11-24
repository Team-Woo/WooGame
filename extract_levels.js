const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Regex to find the levels array
// Looking for "const levels = [" ... "];"
const startMarker = 'const levels = [';
const startIndex = htmlContent.indexOf(startMarker);
if (startIndex === -1) {
    console.error('Could not find levels array start');
    process.exit(1);
}

// Find the matching closing bracket for the array
let openBrackets = 0;
let arrayContent = '';
let foundEnd = false;
let arrayStartIndex = startIndex + startMarker.length - 1; // include the '['

for (let i = arrayStartIndex; i < htmlContent.length; i++) {
    const char = htmlContent[i];
    if (char === '[') openBrackets++;
    if (char === ']') openBrackets--;

    arrayContent += char;

    if (openBrackets === 0) {
        foundEnd = true;
        break;
    }
}

if (!foundEnd) {
    console.error('Could not find levels array end');
    process.exit(1);
}

// Evaluate the array string to get the object
const sandbox = {};
const levels = vm.runInNewContext(`const levels = ${arrayContent}; levels;`, sandbox);

console.log(`Found ${levels.length} levels.`);

levels.forEach((level, index) => {
    const levelNum = index + 1;
    const filename = `level_${levelNum}.json`;
    const filePath = path.join(__dirname, 'levels', filename);

    // We only want to save the data part to the file, or maybe the whole object?
    // The plan said: "Extract each level's data (specifically the `data` property...) into `levels/level_N.json`"
    // But also: "Update the `levels` constant to include a `filename` property"
    // So the JSON file should probably contain the `data` object.

    const levelData = level.data;
    fs.writeFileSync(filePath, JSON.stringify(levelData, null, 0)); // Minified to save space? Or null, 2 for readability? 
    // The grid is huge, so maybe no indentation for the grid array, but indentation for the rest?
    // JSON.stringify doesn't support mixed indentation.
    // Let's just do standard stringify. The user can format it if they want.

    console.log(`Wrote ${filePath}`);
});

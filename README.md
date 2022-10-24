### _Parse **HL7** message to **JSON** and stringify **JSON** to **HL7** message_

---
**NOTE**

- This is module does not follow any standart for HL7 messages
- Messages are considered to be valid as long as they can be parsed
---
**Install**
npm i hl72json
---



- No dependencies
- Support for Typescript
- Easy interface
- Support for custom messages
- Works on any Javascript runtime that supports **ES5**

Examples
````js
import hl7 from "hl7-json";
const message = "MSH|^~\\&|LAB^LAB1|MYFAC|LAB|..."
const parsedMessage = hl7.parse(message);
hl7.stringify(parsedMessage) === message //true
````
Reading
````js
parsedMessage[0][1][1] // LAB1
````
Setting
````js
parsedMessage[0][1][1] =  {
    "0": "Let's",
    "1": "Try",
    "2": "Something",
    "3": "Cool",
    "4": "",
    "7": "BOOOM"
}
hl7.stringify(parsedMessage) //MSH|^~\&|LAB^Let's&Try&Something&Cool&&BOOOM|MYFAC|LAB...
````
![Alt text](./src/examples/example.png?raw=true "Example.png")
Check **example.json** for a detailed example


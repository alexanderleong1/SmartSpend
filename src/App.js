import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend} from 'recharts';
import {useForm} from "react-hook-form";
import './App.css';
import Tesseract from 'tesseract.js';
//import axios from 'axios';

var food = 1;
var clothing = 1;
var appliances = 1;
var entertainment = 1;
var other = 1;

const data = [
  {name: 'Food', cost: food},
  {name: 'Clothing', cost: clothing},
  {name: 'Appliances', cost: appliances},
  {name: 'Entertainment', cost: entertainment},
  {name: 'Other', cost: other}
];

/**
 * Price parser from receipt image. Built using Tesseract.js library.
 * Tesseract.js GitHub: https://github.com/naptha/tesseract.js?files=1
*/

/**
 * Utilizes the Tesseract.js OCR to translate text in an image into words.
 * After the text has been converted into a string, the string is split by whitespace characters,
 * and stored in a string array. This string array is then passed as an argument
 * to methods that search for 
 * 
 * @param fileName - The file name of the receipt we are reading the total amount from. Must be passed as a String.
 * 
 * @return returns the floating-point value of the total parsed from the receipt.
 */

 function parseText(fileName) {
  Tesseract.recognize(
      fileName,
      'eng',
   { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
      console.log(text);
      const wordArr = text.replace(/\n/g, " ").split(" ");
      const result = find_total(wordArr);
      data[0].cost = result;
  }).catch(err=>{
      console.log(err);
      throw (err);
  })
}

/**
* Using an array of strings, finds the last instance of words that indicate "total amount of money".
* This is determined by the Levinshtein distance. If the Levinshtein distance is less than 3, we take it as the total.
* Passes this index to a helper function, along with a sliced portion of the array from the index onwards.
* 
* @param {*} wordArr - the string of all words from our Tesseract OCR, split into an array of strings.
* 
* @return the result of finding the floating-point value of the total read from the receipt.
*/
function find_total(wordArr) {
  var i;
  for(i = wordArr.length-1; i >=0; i--) {
      var formatter = wordArr[i].toLowerCase().replace(/\s+/g, "");
      // Check the Levanshtein distance between the parsed text and expected indicators of total amount
      if(levDistance(formatter, "total") < 3
      || levDistance(formatter, "balance") < 3
      || levDistance(formatter, "due") < 3
      || levDistance(formatter, "amount") < 3) {
          console.log(formatter);
          // Then we pass the array sliced from formatter onwards to helper function.
          wordArr = wordArr.slice(i);
          return find_total_helper(wordArr);
          // document.getElementById("textfield").innerHTML+=wordArr[i+1];
      }
  }
}

/**
* Using a preprocessed string of arrays, finds the instance that best matches the floating-point value for the grand total.
* 
* @param {*} wordArr - string array of words parsed from the receipt by Tesseract OCR. Preprocessed by find_total().
* 
* @return a floating-point value containing the total amount read from the receipt. Bubbles up the call stack to parseText().
*/
function find_total_helper(wordArr) {
  for(var i = 0; i < wordArr.length; i++) {
      console.log(wordArr[i]);
      if(wordArr[i].charAt(0)=='$') {
          wordArr[i] = wordArr[i].slice(1);
      }
      let checkIfFloat = parseFloat(wordArr[i]);
      if(!isNaN(checkIfFloat) && checkIfFloat != "" && checkIfFloat != " ") { // First instance of a floating-point after one of the "total" key words
        console.log(wordArr[i]);  
        return wordArr[i];
      }
  }
}

/**
* Function to find the Levanshtein distance of two strings.
* The Levanshtein distance is essentially a measure of how close two strings are to each other.
* 
* @param {String} a the first string to compare
* @param {String} b the second string to compare with the first string
* @returns an integer measurement of how far apart two strings are.
*/
function levDistance(a, b) {
  if(b.toString().length==0) {
      return a.length;
  }
  if(a.toString().length==0) {
      return b.length;
  }
  if(a.toString().charAt(0)==b.toString().charAt(0)) {
      return levDistance(getTail(a), getTail(b));
  }
  return 1 + Math.min(levDistance(getTail(a), b), levDistance(a, getTail(b)), levDistance(getTail(a),getTail(b)));
}

/**
* Helper function to determine Levanshtein distance. Extracts the first character from the string, leaving only the trailing characters.
* 
* @param {String} str to get the tail of. 
* @returns a string with the first character removed.
*/
function getTail(str) {
  return str.toString().slice(1);
}

function App() {
  const {register, handleSubmit} = useForm();

  const onSubmit = (data) => {
    console.log(data)
  };

  const colors = ['#2085EC', '#72B4EB', '#0E59AA', '#8464A0', '#ba7ba1'];

  



  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill={colors[index % colors.length]} fontFamily='verdana' fontSize={18} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {"$" + data[index].cost.toFixed(2)}
      </text>
    );
  };

  return (
    <body>
        <div className='header'>
          <div className='headercard'> <h1>SmartSpend</h1> </div>
        </div>

        <div className="row">
          <div className="leftcolumn">
            <div className="card">
              <h1>Total Spendings</h1>
              <div style={{width: "100%", height: 400}}>
   
    <ResponsiveContainer>
    <PieChart width={850} height={400}>
      <Pie 
        cx="50%" cy="50%" 
        data={data} 
        dataKey="cost" 
        isAnimationActive={true} 
        innerRadius={75} 
        outerRadius={150} 
        fill="8884d8" 
        legendType='circle'
        label={renderCustomizedLabel}>
          {data.map((entry, index) => <Cell fill={colors[index % colors.length]}/>)};
      </Pie>
      <Legend verticalAlign='bottom' height={36}/>
    </PieChart>
  </ResponsiveContainer>

              </div>
            </div>
          </div>
          <div className="rightcolumn">
            <div className="card">
              <form onSubmit={handleSubmit(onSubmit)}>
                <h1>Scan Receipt</h1>
                <input id="picture" type="file"/>
                <button className="button button1" >Upload image of receipt</button>
              </form>
            </div>
          </div>
        </div>
    </body>
  );
}

export default App;

# Welcome to another Drill Down

- You may check [demo](https://bilalshahzad139.github.io/bsdrilldown.html) here

## Purpose
Allowing User to select a node from hierarchical data by drilling it down to **n** level.

## Dependency
JQuery

## Input
### Configuration

 1. Data Object (which contains hierarchical data and have following fields
	- Some ID unique field at specific level
	- Name field to display
	- Level field 
	- An Array property which holds child object
	- Example: {ID: 1, Name: "Pakistan", Level: 1, Child: [{ID:2, Name: "Lahore", Level:2, Child:[]}]} 
		- In this Example, Name of these properties can be anything + Object may contain many more fields
 2. Configuration
	 - **mainSelector**
		 - Selector of main container. Example: mainSelector:  '#divHerirachy'
	 - **keyField**
		 - Name of Key Column in data. Example keyField: 'ID'
	 - **displayField**
		 - Name of Display Column in data. Example displayField: 'Name'
	 - **levelField**
		 - Name of Column which contains level information. Example levelField: 'Level'
	 - **ChildField**
		 - Name of Column which contains Child data. Example ChildField: 'Child'  
	 - **headerSelector**
		 - Selector of DOM element where to show selected hierarchy. Example headerSelector: '#hp_header'
	- **hpBodySelector**
		 - Selector of container where to show current child. Example hpBodySelector: '#hp_body'  
	- **empLevel**
		 - Level from where Employee (or whatever meaningful data) data starts. Example empLevel: 3
	- **defaultState**
		 - What to show as default selection. Example defaultState: [-1] 

## How It works
- It takes an object which contains hierarchical data & configuration. 
- It prepares an internal hierarchical Data Structure which stores objects against key as attribute. It gives fast retrieval of Child elements. 
- It also prepares another data structure which stores data in linear format. This stores data level wise.
- Each Node contains three parameters
	- Data (which contains actual data object + Hierarchy Paths)
	- Child (which contains child nodes)
	- Parent (pointing to parent object)
- Both data structures refer same data objects.
- Each data object also stores hierarchy path (till empLevel) details.

## How to Use
### Step 1: Import JS & CSS files
    <script  src="jquery-3.4.1.min.js"></script>
    <script  src="BsDrillDown.js"></script>
    <link  href="bsdrilldown.css"  rel="stylesheet">
### Step 2: Have data in JSON format

    {
    "ID":-1, "Name": "Root", "Level":0,
    "ChildData":[{"ID":1, "Name": "A", "Level":1,
    	"ChildData":[{ "ID":3, "Name": "C", "Level":2,
    		"ChildData":[{"ID":5,"Name": "D", "Level":3,
    			"ChildData":[{"ID":6, "Name": "E", "Level":4, "ChildData":[]}]
    },{"ID":7, "Name": "F", "Level":3,
    		"ChildData":[]}]},
    {"ID":4, "Name": "G", "Level":2,"ChildData":[]}]
    },
    {"ID":2, "Name": "B", "Level":1,
    "ChildData":[{"ID":9, "Name": "I", "Level":2,
    	"ChildData":[]
    },
    {"ID":10, "Name": "J", "Level":2,
    	"ChildData":[]
    }]
    },
    {"ID":8, "Name": "H", "Level":1,
    "ChildData":[]
    }]}

### Step 3: Sample HTML Structure

    <button  id="btnShowHierarch">Show</button>
    <div  id="divHerirachy"  style="display:none;width: 450px;">
    <div  class="drildown-container">
    <div  id="hp_header"></div>
    <div>
    <ul  id="hp_body"  class="hierarchy-custom"></ul>
    </div></div>
    <div  class="drilldown-footer">
    <button  id="btnCatDone">Done</button>
    <button  id="btnCancel">Cancel</button>
    </div>
    </div>

### Step 4: Initialize Drilldown

Here **data** contains hierarchical data (Step 2)  

    BsDrillDown.initialize({
    headerSelector:  '#hp_header',
    hpBodySelector:  '#hp_body',
    keyField:  'ID',
    displayField:  'Name',
    ChildField:  'ChildData',
    levelField:  'Level',
    defaultState:[-1],
    empLevel:3
    }, data);

## Utility Functions
- BsDrillDown.getData(): It returns internal hierarchical data structure.
- BsDrillDown.getDataByLevel(level). It takes level (number) and returns linear list of elements for that specific level.
- BsDrillDown.SelectHerirachyByKeys(topLevelKeys, empKey): It takes an array of keys and select specific node. If empKey is provided, it finds node in down hierarchy.
- BsDrillDown.getCurrentNode(): It returns current data object.
- BsDrillDown.getCurrentHierarchy(): Library manages current drill down hierarchy in a number array. This function returns that array. For example [-1,1,4] is returned if user has selected Root -> A -> G in above data.
- BsDrillDown.getDataByLevelAndKey(level,key): It finds object against a key from specific level array.
- BsDrillDown.getAllChlideNodesOfCurrentSelection(filterCriteriaFn): It gives all child of current node till end in linear array format. It also calls the function (provided as input) so you may filter nodes.
- BsDrillDown.getCurrentHierarchyDetail(topLevelKeys): It returns detailed object against keys array.
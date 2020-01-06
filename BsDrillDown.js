var BsDrillDown = (function () {

    var innerDataStructure = { Child: {} };
    var levelWiseData = {};

    var currentNode = {};
    var keysArray = [];
    var tempKeysArray = [];

    var tempCurrentNode = {};

    var opts = {
        mainSelector: '#divHerirachy',
        keyField: 'OrgId',
        displayField: 'OrgName',
        ChildField: 'ChildOrgEntity',
        levelField: 'OrgLevel',
        headerSelector: '#header',
        hpBodySelector: '#hp',
        empLevel: 5,
        defaultState: [-1],
        headerEleClass: 'hp-header-breadcrumb'
    };

    var $mainContainer = null;
    var $header = null;
    var $hpBody = null;


    function init(options, data) {

        opts = $.extend(opts, options);

        $mainContainer = $(opts.mainSelector);
        $header = $mainContainer.find(opts.headerSelector);
        $hpBody = $mainContainer.find(opts.hpBodySelector);

        keysArray = opts.defaultState;

        EventBinding();
        Generate(data);
        currentNode = innerDataStructure;
        //GenerateChildElementsInHp();
    }

    function onHPShow() {
        tempKeysArray = keysArray.slice();
        $header.empty();
        var result = FindNodebyKeys(keysArray, true);
        currentNode = result.currNode;
        $header.append(result.header);
        GenerateChildElementsInHp();
        //$mainContainer.show();
    }

    function onSelectionDone() {
        keysArray = tempKeysArray.slice();
        //$mainContainer.hide();
        return keysArray;
    }

    function onSelectionCancel() {
        tempKeysArray = [];
        //$mainContainer.hide();
    }

    function EventBinding() {

        $hpBody.on('click', 'a', function (e) {
            e.preventDefault();

            $(this).trigger('bsdrilldown.linkclicked');

            var currKey = $(this).data('oid');
            tempKeysArray.push(currKey);
            CreateHeaderNode($(this).text(), currKey, $header);
            currentNode = currentNode.Child[currKey];
            GenerateChildElementsInHp();

            return false;
        });

        $header.on('click', 'a.' + opts.headerEleClass, function (e) {
            e.preventDefault();
            HpHeaderHandler($(this));
        });
    }

    function Generate(root) {
        var key = root[opts.keyField];

        var nonHierObj = Object.assign({}, root);
        delete nonHierObj[opts.ChildField];
        nonHierObj.HierPaths = [];

        innerDataStructure.Child[key] = { Data: nonHierObj };
        innerDataStructure.Child[key].Child = {};
        levelWiseData[0] = [];
        levelWiseData[0].push(nonHierObj);

        if (root[opts.ChildField] && root[opts.ChildField].length > 0) {
            GenerateList(root, root[opts.ChildField], innerDataStructure.Child[key], {});
            delete innerDataStructure.Child[key][opts.ChildField];
        }
    }

    function GenerateList(parent, list, parentInNewFormt, topLevelKeys) {


        if (parentInNewFormt.Child == undefined)
            parentInNewFormt.Child = {};

        for (var i = 0; i < list.length; i++) {
            var objInOldFormat = list[i];
            var level = objInOldFormat[opts.levelField];
            var key = objInOldFormat[opts.keyField];

            if (level >= 1 && level < opts.empLevel) {
                topLevelKeys[level] = key;
                for(var l = opts.empLevel-1;l > level;l-- ){
                    delete topLevelKeys[l];
                }
            }

            if (level > opts.empLevel)
                level = opts.empLevel;

            if (levelWiseData[level] == undefined)
                levelWiseData[level] = [];


            var nonHierObj = MyFind(levelWiseData[level], opts.keyField, key)
            if (!nonHierObj) {
                nonHierObj = Object.assign({}, objInOldFormat);
                delete nonHierObj[opts.ChildField];
                nonHierObj.HierPaths = [];
                levelWiseData[level].push(nonHierObj);
            }

            //if (level == opts.empLevel) {
                nonHierObj.HierPaths.push(Object.assign({}, topLevelKeys));
            //}


            parentInNewFormt.Child[key] = { Data: nonHierObj }
            parentInNewFormt.Child[key].Child = {};
            parentInNewFormt.Child[key].Parent = parentInNewFormt;
            delete parentInNewFormt.Child[key][opts.ChildField];


            if (objInOldFormat[opts.ChildField] && objInOldFormat[opts.ChildField].length > 0) {
                GenerateList(objInOldFormat, objInOldFormat[opts.ChildField], parentInNewFormt.Child[key], topLevelKeys);
            }
            else {
                parentInNewFormt.Child[key].islast = true;
            }
        }// end of for
    }// end of GenerateList


    function FindChildNodes(list, resultToReturn,filterCriteriaFn) {

        var childKeys = Object.keys(list);
        for (var key in list) {
            var obj = list[key];
            if(filterCriteriaFn && filterCriteriaFn(obj.Data) == true){
                if(!MyFind(resultToReturn, opts.keyField, obj.Data[opts.keyField]))
                    resultToReturn.push(obj.Data)
            }
            if (obj.Child && Object.keys(obj.Child).length > 0) {
                FindChildNodes(obj.Child, resultToReturn,filterCriteriaFn);
            }
        }// end of for
    }// end of GenerateList


    function GenerateChildElementsInHp() {

        var $documentFragment = $(document.createDocumentFragment());

        var childKeys = Object.keys(currentNode.Child);
        for (var i = 0; i < childKeys.length; i++) {
            var key = childKeys[i];
            var textToDisplay = currentNode.Child[key].Data[opts.displayField];
            var childCount = Object.keys(currentNode.Child[key].Child).length;
            var extText = "";
            if (childCount > 0)
                extText = "(" + childCount + ")";

            var $a = $("<a href='#'/>").text(textToDisplay + extText).data('oid', key).attr('oid', key);
            var $li = $("<li>").append($a);
            if (childCount > 0) {
                $li.append('<span class="fa fa-chevron-right pull-right"></span>');
            };
            $documentFragment.append($li);
        }

        $hpBody.html('').append($documentFragment);
    }

    function CreateHeaderNode(text, key, $headerObj) {
        var $a = $("<a href='#' class='" + opts.headerEleClass + "'/>").html(text + " <span>/</span> ").data('oid', key).attr('oid', key);
        $headerObj.append($a);
    }

    function HpHeaderHandler($this) {
        $this.nextAll().remove();
        tempKeysArray = GetKeysFromHeader();
        var result = FindNodebyKeys(tempKeysArray);
        currentNode = result.currNode;
        GenerateChildElementsInHp();
    }

    function GetKeysFromHeader() {
        var keys = [];
        $header.find("a." + opts.headerEleClass).each(function () {
            keys.push($(this).data('oid'));
        });
        return keys;
    }

    function GetNodesListbyKeys(topLevelkeys) {

        //Starting Point
        var _currentNode = innerDataStructure;
        var _resultToReturn = [];

        //Iterate keys Array 
        for (var i = 0; i < topLevelkeys.length; i++) {
            var key = topLevelkeys[i];
                //simply find node from child and make that node as current node
                _currentNode = _currentNode.Child[key];
                if(_currentNode.Data)
                    _resultToReturn.push(_currentNode.Data);
        }

        return _resultToReturn;
    }

    function FindNodebyKeys(keys, updateHeader) {

        var $documentFragment = null;

        if (updateHeader) {
            $documentFragment = $(document.createDocumentFragment());
        }

        //Starting Point
        var _currentNode = innerDataStructure;

        //Iterate keys Array 
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            //If a key is provided as 0, it means iterate all child elements and find next key in them
            if (key == 0) {
                for (var childKey in _currentNode.Child) {
                    if (_currentNode.Child[childKey].Child[keys[i + 1]]) {
                        _currentNode = _currentNode.Child[childKey];
                        break;
                    }
                }
            }
            else {
                //simply find node from child and make that node as current node
                _currentNode = _currentNode.Child[key];
            }

            if (updateHeader) {
                var extText = "";

                var childCount = Object.keys(_currentNode.Child).length;
                if (childCount > 0)
                    extText = "(" + childCount + ")";
                CreateHeaderNode(_currentNode.Data[opts.displayField] + extText, key, $documentFragment);
            }
        }

        return { currNode: _currentNode, header: $documentFragment };
    }

    //It takes a list of nodes and find a node by key. It also allows to search from specific level.
    //It returns list of nodes from target node, goes up till nodeToFindSearchStartlevel
    function FindNodeByKey(list, nodeToFindKey, nodeToFindSearchStartlevel) {

        for (var nodeKey in list) {

            if (list[nodeKey].Data[opts.levelField] >= nodeToFindSearchStartlevel && nodeKey == nodeToFindKey) {
                return [list[nodeKey]];
            }
            else {
                var result = FindNodeByKey(list[nodeKey].Child, nodeToFindKey, nodeToFindSearchStartlevel);
                if (result) {
                    result.push(list[nodeKey]);
                    return result;
                }
            }
        }
    }

    //It selects a node in hierarcal way by using toplevel keys
    //then it find
    function FindAndSelectHerirachy(topLevelKeys, nodeToFindKey) {

        var resultToReturn = topLevelKeys.slice();
        var result = FindNodebyKeys(topLevelKeys);
        currentNode = result.currNode;
        //topLevelKeys have found some node
        if (result.currNode && nodeToFindKey) {

            var nodesFromTargetTillSearchLevel = FindNodeByKey(result.currNode.Child, nodeToFindKey, opts.empLevel);
            if (nodesFromTargetTillSearchLevel && nodesFromTargetTillSearchLevel.length > 0) {
                currentNode = nodesFromTargetTillSearchLevel[0];
                for (var i = nodesFromTargetTillSearchLevel.length - 1; i >= 0; i--) {

                    resultToReturn.push(nodesFromTargetTillSearchLevel[i].Data[opts.keyField]);
                }
            }
        }
        keysArray = resultToReturn.slice();
        console.log(keysArray);
        return resultToReturn;
    }

    //Helper Method
    function MyFind(arr, attrToMatch, valueToMatch) {
        return arr.find(function (element) {
            return element[attrToMatch] == valueToMatch;
        });
    }

    return {
        initialize: function (settings, data) {
            init(settings, data);
        },
        getData: function () {
            return innerDataStructure;
        },
        getDataByLevel: function (level) {
            return levelWiseData[level];
        },
        SelectHerirachyByKeys: function (topLevelKeys, empKey) {
            if (topLevelKeys && topLevelKeys.length == 0)
                topLevelKeys = [-1];
            return FindAndSelectHerirachy(topLevelKeys, empKey);
        },
        showHP: function () {
            onHPShow();
        },
        doneSelection: function (callBackFn) {
            callBackFn(BsDrillDown.getCurrentNode(), function () {
                return onSelectionDone();
            });
        },
        cancelSelection: function () {
            onSelectionCancel();
        },
        getCurrentNode: function () {
            return currentNode.Data;
        },
        getCurrentHierarchy: function () {
            return keysArray;
        },
        getDataByLevelAndKey: function(level,key){
            return MyFind(levelWiseData[level],opts.keyField,key);
        },
        getAllChlideNodesOfCurrentSelection: function(filterCriteriaFn){
            var resultToReturn = [];
            if(filterCriteriaFn && filterCriteriaFn(currentNode.Data) == true){
                resultToReturn.push(currentNode.Data);
            }

            FindChildNodes(currentNode.Child, resultToReturn,filterCriteriaFn);
            return resultToReturn;
        },
        getCurrentHierarchyDetail: function(topLevelKeys){
            return GetNodesListbyKeys(topLevelKeys);
        }
    };

}());



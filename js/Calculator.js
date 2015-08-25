var Calculator = angular.module('Calculator',[]);











Calculator.service('DataShareService', function($rootScope) {
	

	return {
		//This is a shared public function which maintains the Generic Data for Sharing across different controllers.
		//This code is referenced from the library blog. http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
		convertToRoman : function(num) {
			if (!+num)
				return "Not a Proper Roman number";
			var	digits = String(+num).split(""),
				key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
				       "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
				       "","I","II","III","IV","V","VI","VII","VIII","IX"],
				roman = "",
				i = 3;
			while (i--)
				roman = (key[+digits.pop() + (i * 10)] || "") + roman;
			return Array(+digits.join("") + 1).join("M") + roman;			
		},
		
		
		convertToDecimal : function(str) {
    		var	str = str.toUpperCase(),
    			validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/,
    			token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g,
    			key = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},
    			num = 0, m;
    		if (!(str && validator.test(str)))
    			return false;
    		while (m = token.exec(str))
    			num += key[m[0]];
    		return num;
    	}
	
	
	
	
	};
}); 

angular.module('Calculator').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('html/partials/DigitsPanel.html',
    "<!--Placeholder for the first row digits --><div class=\"smaller-digits\"><div class=\"button-holder-digits\"><button class=\"digits-button\" ng-click=\"readDigitValue('I')\">{{i18n.NUMBER_I}}</button></div><div class=\"button-holder-digits\"><button class=\"digits-button\" ng-click=\"readDigitValue('V')\">{{i18n.NUMBER_V}}</button></div><div class=\"button-holder-digits\"><button class=\"digits-button\" ng-click=\"readDigitValue('X')\">{{i18n.NUMBER_X}}</button></div></div><!--Placeholder for the second row digits --><div class=\"higher-digits\"><div class=\"button-holder-digits\"><button class=\"digits-button\" ng-click=\"readDigitValue('L')\">{{i18n.NUMBER_L}}</button></div><div class=\"button-holder-digits\"><button class=\"digits-button\" ng-click=\"readDigitValue('C')\">{{i18n.NUMBER_C}}</button></div><div class=\"button-holder-digits\"><button class=\"digits-button\" ng-click=\"readDigitValue('D')\">{{i18n.NUMBER_D}}</button></div></div>"
  );


  $templateCache.put('html/partials/FunctionsPanel.html',
    "<!--Placeholder for the the clear and Equals(Result) buttons --><div class=\"clear-digits-panel\"><div class=\"button-holder-clear\"><button class=\"digits-button\" ng-click=\"clearResult()\">{{i18n.CLEAR}}</button></div><div class=\"button-holder-clear\"><button class=\"digits-button\" ng-click=\"showResult()\">{{i18n.EQUALS}}</button></div></div><div class=\"main-functions-panel\"><!--Placeholder for the Add/Subtract buttons --><div class=\"top-functions-panel\"><div class=\"button-holder-functions\"><button class=\"digits-button\" ng-click=\"readOperator('+')\">{{i18n.ADD}}</button></div><div class=\"button-holder-functions\"><button class=\"digits-button\" ng-click=\"readOperator('square')\"><span class=\"label-class\">{{i18n.SQUARE}}</span></button></div></div><!--Placeholder for the Multiply and Power of N buttons --><div class=\"lower-functions-panel\"><div class=\"button-holder-functions\"><button class=\"digits-button\" ng-click=\"readOperator('*')\">{{i18n.MULTIPLY}}</button></div><div class=\"button-holder-functions\"><button class=\"digits-button\" ng-click=\"readOperator('^')\">{{i18n.POWER_OF_N}}</button></div></div></div>"
  );


  $templateCache.put('html/partials/Navigator.html',
    "<div ng-controller=\"MainController\"><div class=\"calculator-main-panel\"><!--Result Display Section --><input type=\"text\" disabled=\"true\" ng-model=\"result_display_value\" class=\"result-width\"><!--This HTML has 2 panels. 1 for Digits interaction. 2 for Functions. If required, Custom Directives can also be used instead of ng-templates for further interaction if any. --><div class=\"calculator-interactive-panel\"><div class=\"calculator-digits-panel\" ng-include src=\"'html/partials/DigitsPanel.html'\"></div><div class=\"calculator-functions-panel\" ng-include src=\"'html/partials/FunctionsPanel.html'\"></div></div></div></div>"
  );

}]);

Calculator.controller('MainController', function($scope, $rootScope,DataShareService, $http){
	$scope.i18n = i18n;    
});
Calculator.directive('mainDirective',['$compile','$templateCache','DataShareService',function($compile,$templateCache, DataShareService){
    var linkFunction;
    //We can/cannot use this variable. This can be directly assigned to the template parameter down bottom. It's programmers preference
    var myTemplate = $templateCache.get('html/partials/Navigator.html');
    linkFunction = function($scope,element,attrs) { 
    	$scope.first_number = "";//Keeps track of the first number
    	$scope.operator_value = ""; //Keeps track of the operator that is to be perfomered on the variables
    	$scope.second_number = ""; //Keeps track of the second number
    	$scope.operator_count = 0; //Checks for the operator count.    	
    	var first_temp_value = "";
    	var second_temp_value = ""; 
    	$scope.result_display_value = ""; //The output display value on the calculator
    	//This function reads the values entered by the user in Roman Numbers, further stores the values correspondingly based on the operator count
    	//If the operator count is 0, the function considers the value input as first_number, else the value input is read into second_number. The conversion to Roman and Decimal are done as and when required.
    	$scope.readDigitValue = function(value)
    	{      		
    		if($scope.operator_count == 0)
			{
    			first_temp_value += value;
    			$scope.first_number = DataShareService.convertToDecimal(first_temp_value,true);
    			$scope.result_display_value = DataShareService.convertToRoman(parseInt($scope.first_number,10))+"("+$scope.first_number+")";
			}
    		else
			if($scope.operator_count == 1)
			{
				second_temp_value += value;
    			$scope.second_number = DataShareService.convertToDecimal(second_temp_value,true);
    			//Value is not appended as in the earlier case because, there might be cases where the user might create a new number while clicking on 2 numbers as I and V making up to 4.
    			$scope.result_display_value = DataShareService.convertToRoman(parseInt($scope.first_number,10))+"("+$scope.first_number+")" + $scope.operator_value + DataShareService.convertToRoman(parseInt($scope.second_number,10))+"("+$scope.second_number+")";;
			}
    	};
    	
    	//This function reads the Operator thus entered by the user.
    	$scope.readOperator = function(operator)
    	{	
    		if($scope.operator_count == 0)
			{
    			$scope.operator_value = operator;    			
    			$scope.operator_count = 1;    			
    			if($scope.operator_value == "square")//Square is always a special case, where we have to do the calculation as soon as the user hits the square button.
				{
    				$scope.result_display_value += "* ("+$scope.first_number+ ")";
    				$scope.first_number = $scope.calculateResult($scope.first_number,"",  $scope.operator_value);
    				$scope.operator_value = "";
    				$scope.operator_count = 0;    	
				}
    			else
    			{
    				$scope.result_display_value += $scope.operator_value;
    			}
    			
    			
			}
    		else
			if($scope.operator_count == 1)
			{
				//Checks if the $scope.operator_value has any previous operator existing. If Yes, then the previous operator takes the precedence and calculates the value result with the previous result and then adds the new operator to the $scope.operator value after the calculation.
				if($scope.operator_value == "")
				{
					$scope.operator_value = operator;
				}
				first_temp_value = "";
				second_temp_value = "";
				if(operator == "square")//If there is already an existing operator and the user hits the square, then first calculate the value for the previous operator and then calculate for square and flush all the settings.
				{
					$scope.first_number = $scope.calculateResult($scope.first_number, $scope.second_number, $scope.operator_value);
    				$scope.first_number = $scope.calculateResult($scope.first_number,"",  operator);
    				$scope.operator_value = ""; 
    				$scope.operator_count = 0;
				}
				else//If there is already an exisitng operator, then just calculate fthe value for the previous operator and await instructions
				{
					$scope.first_number = $scope.calculateResult($scope.first_number, $scope.second_number, $scope.operator_value);
					$scope.operator_value = operator;
					$scope.result_display_value += $scope.operator_value;
					$scope.operator_count = 1;
				}  			 
			}
    	};
    	
    	//Single Function call to calculate the result of the values entered. Based on the operator selected, the Switch - Case section handles the operation accordingly.
    	//This function is an example of reusability, where we utilize this function based on the operator which the user selects.
    	$scope.calculateResult= function(first_number, second_number, operator)
    	{
    		var temp_val;
    		switch (operator) 
    		{
	    	    case "+":
	    	        temp_val = (first_number + second_number);
	    	        break;
	    	    case "square":
	    	    	temp_val = (first_number * first_number);	    	    	
	    	        break;
	    	    case "*":
	    	    	temp_val = (first_number * second_number);
	    	    	break;
	    	    case "^":
	    	    	temp_val = Math.pow(first_number,second_number);
	    	    	break;    	   
    		}
	    	 
    		//Numbers greater than 10000 in Roman Numerals are shown as multiples of M, here the result is just shown as M* for convenient purposes
    		//Numbers less than 10000 are calculated and displayed accordingly.
	    	if(parseInt(temp_val,10) <=10000)
        	{
	        	$scope.result_display_value = DataShareService.convertToRoman(parseInt(temp_val,10))+"("+temp_val+")";
        	}
	        else
	        {
	        	$scope.result_display_value = "M* ("+parseInt(temp_val,10)+")";
	        }
    		return temp_val;
    	};
    	
    	//When the user clicks on "=". this function displays result and stores the result in the first number and awaits further user actions. This function also restes the operator count and value.
    	$scope.showResult = function()
    	{
	    	if(($scope.first_number != "") && ($scope.second_number != "") && ($scope.operator != ""))
	    	{
				$scope.first_number = $scope.calculateResult($scope.first_number, $scope.second_number, $scope.operator_value);
				$scope.operator_count = 0;
				$scope.operator_value = "";
				first_temp_value = "";
				second_temp_value = "";
	    	}    		
    	}
    	
    	//This function clears everything and resets everything.
    	$scope.clearResult = function()
    	{
    		$scope.result_display_value = "";
    		$scope.first_number = "";
    		$scope.second_number = "";
    		$scope.operator_value = "";
    		$scope.operator_count = 0;
    		first_temp_value = "";
    		second_temp_value = "";
    	}
    };
    return {
        restrict    : 'E',
        replace     : true,
        template    : myTemplate,
        link        : linkFunction
    };
}]);
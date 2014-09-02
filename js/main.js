var app = angular.module('app', []);


app.controller('CreateTransfer', function($scope, $http, $timeout, Currencies) {
    // Set model
    $scope.Currencies = Currencies;
    $scope.CurrenciesOutput = {};

    // Set variables
    $scope.transferAmount = 1000;
    $scope.transferPayout = 0;
    $scope.transferRate = 0;
    $scope.loading = true;
    $scope.fixedAmount = false;

    // Set default currency codes
    $scope.currencyInputCode = "GBP";
    $scope.currencyOutputCode = "EUR";




    $scope.changeCurrency = function() {
        $scope.loading = true;
        $scope.getOutputCurrencies();
    }

    $scope.toggleFixedAmount = function() {
        $scope.fixedAmount = !$scope.fixedAmount;
    }

    $scope.getOutputCurrencies = function() {
        for (var i=0; i < $scope.Currencies.list.length; i++) {
            if ($scope.currencyInputCode == $scope.Currencies.list[i].currencyCode) {
                $scope.CurrenciesOutput.list = $scope.Currencies.list[i].targetCurrencies;
                $scope.getTransferDetails();
                break;
            }
        }
    }

    $scope.getTransferDetails = function() {
        var amount = ($scope.fixedAmount) ? $scope.transferPayout : $scope.transferAmount;
        var amountCurrency = ($scope.fixedAmount) ? "target" : "source";

        $http.get('./proxy/api_proxy.php?param=payment%2Fcalculate' +
                        '%3Famount%3D'+ amount +
                        '%26sourceCurrency%3D' + $scope.currencyInputCode +
                        '%26targetCurrency%3D' + $scope.currencyOutputCode +
                        '%26amountCurrency%3D' + amountCurrency)
            .success(function (data) {
                if (!data.errors) {
                    // No error - get transfer details
                    if ($scope.fixedAmount) {
                        $scope.transferAmount = data.transferwisePayIn.toFixed(2);
                    }else{
                        $scope.transferPayout = data.transferwisePayOut.toFixed(2);
                    }
                    $scope.transferRate = data.transferwiseRate;
                    $scope.loading = false;
                }else if(data.errors[0].code == "EQUAL_CCY") {
                    // Tried to transfer same currency - get first output currency and recalculate
                    $scope.currencyOutputCode = $scope.CurrenciesOutput.list[0].currencyCode;
                    $scope.changeCurrency();
                }else{
                    // Other error - reset to defaults and recalculate
                    $scope.currencyInputCode = "GBP";
                    $scope.currencyOutputCode = "EUR";
                    $scope.changeCurrency();
                }
            })
            .error(function (data, status, headers, config) {
                console.log("error");
                $scope.loading = false;
            });
    }

    $scope.submitTransfer = function() {
        var amount = ($scope.fixedAmount) ? $scope.transferPayout : $scope.transferAmount;
        var amountCurrency = ($scope.fixedAmount) ? "target" : "source";

        // Currency IDs are hardcoded 
        // Unable to find documentation on how to transform currency code into currency id
        window.location.href = "https://transferwise.com/request/placeOrder" + 
                                    "?sourceValue=" + amount + 
                                    "&sourceCurrencyId=2" + /*$scope.currencyInputCode + */
                                    "&targetCurrencyId=1" + /*$scope.currencyOutputCode + */
                                    "&fixType=" + amountCurrency.toUpperCase();
    }




    var timeoutPromise;

    // Watch amount for changes, update transfer/payout value
    // Using timeout to reduce number of ajax calls when typing amount
    $scope.$watch("transferAmount", function () {
        $timeout.cancel(timeoutPromise);

        timeoutPromise = $timeout(function(){
            if (!$scope.fixedAmount) {
                $scope.getTransferDetails();
            };
        }, 500);
    });

    $scope.$watch("transferPayout", function () {
        $timeout.cancel(timeoutPromise);

        timeoutPromise = $timeout(function(){
            if ($scope.fixedAmount) {
                $scope.getTransferDetails();
            };
        }, 500);
    });
    

    // Watch CUrrencies.list for changes, update output currencies <select> model
    $scope.$watch('Currencies.list', function() {
        if ($scope.Currencies.list && $scope.Currencies.list.length > 0) {
            $scope.getOutputCurrencies();
        };
    });

});



// Return list of currencies from ajax call
app.factory('Currencies', function($http) {
    var Currencies = {};

    $http.get('./proxy/api_proxy.php?param=currency%2Fpairs')
        .success(function (data) {
            Currencies.list = data.sourceCurrencies;
        })
        .error(function (data, status, headers, config) {
            console.log("error");
        });

    return Currencies;
});
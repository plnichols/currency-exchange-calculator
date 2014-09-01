var app = angular.module('app', []);


app.controller('CreateTransfer', function($scope, $http, Currencies) {
    // Set model
    $scope.Currencies = Currencies;
    $scope.CurrenciesOutput = {};
    $scope.loading = true;

    // Set default amount
    $scope.transferAmount = 1000;
    $scope.transferPayout = 0;
    $scope.transferRate = 0;

    // Set default currency codes
    $scope.currencyInputCode = "GBP";
    $scope.currencyOutputCode = "EUR";

    $scope.changeCurrency = function() {
        $scope.loading = true;
        $scope.getOutputCurrencies();
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
        $http.get('./proxy/api_proxy.php?param=payment%2Fcalculate%3Famount%3D'+$scope.transferAmount+'%26sourceCurrency%3D'+$scope.currencyInputCode+'%26targetCurrency%3D'+$scope.currencyOutputCode)
            .success(function (data) {
                if (!data.errors) {
                    // No error - get transfer details
                    $scope.transferPayout = data.transferwisePayOut.toFixed(2);
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

    // When CUrrencies.list changes, update output currencies <select> model
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
            Currencies.total = data.total;
        })
        .error(function (data, status, headers, config) {
            console.log("error");
        });

    return Currencies;
});
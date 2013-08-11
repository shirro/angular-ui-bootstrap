var EditableDemoCtrl = function ($scope) {
    $scope.empty = '';
    $scope.state = false;
    $scope.progmaticColor = 'Red';
    $scope.color = 'Red';
    $scope.colorArray = ['Red', 'Green', 'Blue'];
    $scope.colorObjectDefaults = [{
        key: 'Red',
        label: 'Rojo'
    }, {
        key: 'Green',
        label: 'Verde'
    }, {
        key: 'Blue',
        label: 'Azul'
    }];
};
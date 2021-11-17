var ELEVATOR_STATE = {Choose: 0, Order: 1, Active: 2, Running: 3, ReachedFloor: 4, EndFloor: 5}

Object.freeze(ELEVATOR_STATE)

class ElevatorPeeker
{
    constructor()
    {
        this.allElevators = {}; 
        this.allFloors = {};
        this._noOfFloors = 0;
        this._noOfElevators = 0;
    
        this._orderElevator = []; // elevator + corresponding floor in the order
        this._activeFloors = {};
        this._checkStateOn = false;

        this._elevator_iterator = setInterval(
            this._elevator_check_state.bind(this), 100);
    }

    // **** properties *****
    get noOfFloors() {
        return this._noOfFloors;
    }

    get noOfElevators() {
        return this._noOfElevators;
    }

    // first data load from json.
    loadData() {
        try {
            this._noOfFloors = config_data.noOfFloors;
            this._noOfElevators = config_data.noOfElevators;
            this._showAll();
        }
        catch (e) {
            console.log('invalid config.json format!');
            console.log(e);
        }
    }

    // change current state and push for running the next step
    _change_state(state, new_state)
    {
        state['state'] = new_state;
        this._orderElevator.push(state);
    }

    // interval check state and doing the relevant action.
    _elevator_check_state()
    {
        if (this._checkStateOn)
            return;
        try
        {
            this._checkStateOn = true;

            var elevatorState = null;
            if (this._orderElevator.length > 0) 
                elevatorState = this._orderElevator.shift();
            if (elevatorState)
            {
                switch(elevatorState.state)
                {
                    case ELEVATOR_STATE.Choose:
                        this.peekElevator(elevatorState.floorId);
                        break;
                    case ELEVATOR_STATE.Order:
                        this.orderElevator(elevatorState)
                        break;
                    case ELEVATOR_STATE.Active:
                        var elevatorNo = elevatorState.elevatorNo;
                        var floorId = elevatorState.floorId;
                        this._activeFloors[elevatorState.floorId] = 
                        {
                            'floorId': floorId,
                            'elevatorNo': elevatorNo
                        }
                        
                        $("#elevator_countdown" + floorId).css({
                            'visibility': 'visible'
                        })
                        var floorsLen = this.allElevators[elevatorNo].floors.length;
                        if (floorsLen == 1)
                        {
                            this.allElevators[elevatorNo].totals = {};
                            this.allElevators[elevatorNo].totals.startTime = new Date().getTime();
                            this.allElevators[elevatorNo].totals.extraTime = 0;
                            this.moveElevator(elevatorState);
                        }

                        this.allElevators[elevatorNo].totals.totalTime = elevatorState.totalTime;
                        this.allElevators[elevatorNo].floors[floorsLen - 1].actualTime = elevatorState.totalTime;
                        
                        break;
                    case ELEVATOR_STATE.ReachedFloor:
                        $("#elevator_countdown" + elevatorState.floorId).css({
                            'visibility': 'hidden'
                        })
                        $("#walkers" + elevatorState['floorId']).css({
                            'visibility': 'visible'
                        })
                        delete this._activeFloors[elevatorState.floorId];
                        break;
                    case ELEVATOR_STATE.EndFloor:
                        var elevatorNo = elevatorState.elevatorNo;
                        var floorId = elevatorState.floorId;
                        $("#walkers" + floorId).css({
                            'visibility': 'hidden'
                        })
                        if (elevatorPeeker.allElevators[elevatorNo].floors.length > 0)
                        {
                            elevatorState = elevatorPeeker.allElevators[elevatorNo].floors[0];
                        }
                        break;
                }
            }

            for (var key in this._activeFloors) {
                var floorId = key;
                var elevatorNo = this._activeFloors[key].elevatorNo;
                var remainTime, startTime;
                var floorIdx = this._calculateFloorIdx(floorId, elevatorNo);
                if (floorIdx > -1)
                {
                    var elevatorFloor = elevatorPeeker.allElevators[elevatorNo]['floors'][floorIdx];
                    var actualTime = elevatorFloor.actualTime;
                    startTime = elevatorPeeker.allElevators[elevatorNo]['totals']['startTime'] + elevatorPeeker.allElevators[elevatorNo].totals.extraTime;
                    remainTime =  actualTime;
                    var endTime = startTime + remainTime - 2000;
                    var counterTime = endTime - new Date().getTime(); // + elevatorPeeker.allElevators[elevatorNo]['extraTime'];
                    if (counterTime < 0)
                        counterTime = 0;
                    if (counterTime >= 0)
                        $("#elevator_countdown" + floorId).text((counterTime / 1000).toFixed(1));
                }
            }
        }
        finally
        {
            this._checkStateOn = false;
        }
    }

    // animating moving the elevator
    animate_moving(state, elevator_id, elevatorNo, floorId, targetY, startTime, totalTime)
    {
        $("#" + elevator_id).animate({top: targetY}, totalTime, 'linear', 
            function() {
                $("#ding_stop")[0].play();
                elevatorPeeker._change_state(state, ELEVATOR_STATE.ReachedFloor);
                setTimeout(function() {
                    $("#ding_stop")[0].pause();
                    $("#ding_stop")[0].currentTime = 0;
                    var lastElevator = elevatorPeeker.allElevators[elevatorNo]['floors'].shift();
                    if (elevatorPeeker.allElevators[elevatorNo]['floors'].length > 0)
                    {

                        var extraTime =  new Date().getTime() - (elevatorPeeker.allElevators[elevatorNo]['totals']['startTime'] + lastElevator.actualTime);
                        elevatorPeeker.allElevators[elevatorNo].totals.extraTime = extraTime;

                        elevatorPeeker.moveElevator(elevatorPeeker.allElevators[elevatorNo]['floors'][0]);
                    }
                    elevatorPeeker._change_state(state, ELEVATOR_STATE.EndFloor);
                    elevatorPeeker.allFloors[floorId]['active'] = false;
                    $('#floor_button_' + floorId).removeClass('ordered');
                }, 2000);
            }
        )
    }

    // move the elevator (change some properties + do the animation)
    moveElevator(state)
    {
        var floorId = state['floorId'];
        var elevatorNo = state['elevatorNo'];

        var distance = Math.abs(floorId - this.allElevators[elevatorNo]['floorId']);

        var totalTime = 500 * distance;

        var startTime = new Date().getTime();

        var targetY = (this.noOfFloors - floorId) * 110;
        var elevator_id = this.allElevators[elevatorNo]['id'];
        
        this.allElevators[elevatorNo]['floorId'] = floorId;

        this.animate_moving(state, elevator_id, elevatorNo, floorId, targetY, startTime, totalTime);
    }

    // order the elevator after peeking the right one
    orderElevator(state)
    {
        var floorId = state['floorId'];
        var elevatorNo = state['elevatorNo'];
        $('#floor_button_' + floorId).addClass('ordered');

        this.allElevators[elevatorNo].orderedFloorId = floorId;

        this.allElevators[elevatorNo].floors.push(state);

        this.allElevators[elevatorNo].orderedFloorId = floorId;
        this.allElevators[elevatorNo].extraTime = 0;
        this._change_state(state, ELEVATOR_STATE.Active);
    }


    // find the best elevator (on first click)
    findElevator(floorId)
    {
        this._orderElevator.push({
            'state': ELEVATOR_STATE.Choose,
            'floorId': floorId
        })
    }

    // calculate the total time and the actual time.
    // total - all floors.
    // actual - the current floor from begining of ordering.
    _calculateRemainTotal(floorId, elevatorNo)
    {
        var distance = Math.abs(floorId - this.allElevators[elevatorNo]['orderedFloorId']);
        var totalTime = 500 * distance;
        var lastSumTotal = 0;

        var remainTime;
        var timeDiff = 0;
        var refLen;
        refLen = this.allElevators[elevatorNo]['floors'].length;

        if (refLen == 0) {
            remainTime = totalTime + 2000;
            lastSumTotal = remainTime;
        }
        else {
            // beginning from first floor.
            var lastFloor = this.allElevators[elevatorNo]['floors'][refLen - 1];
            var firstFloor = this.allElevators[elevatorNo]['floors'][0];
            var currentTime = totalTime + 2000;
            var totalFloor = elevatorPeeker.allElevators[elevatorNo]['totals'];
            lastSumTotal = totalFloor['totalTime'] + currentTime;
            // time to reach only the first elevator
            // always the first floor in queue is in current time
            if (this.allElevators[elevatorNo]['floors'].length == 1 )
            {  
                timeDiff = new Date().getTime() - totalFloor['startTime'];
                remainTime = lastSumTotal - timeDiff; 
            }
            else {
                remainTime = lastFloor['actualTime'] + currentTime;
            }
        }

        return [lastSumTotal, remainTime]
    }

    // calculate the floor index in the elevator (when floor id is provided)
    _calculateFloorIdx(floorId, elevatorNo)
    {
        var floorIdx;
        for (var i = 0; i < this.allElevators[elevatorNo]['floors'].length; i++)
        {
            if (this.allElevators[elevatorNo]['floors'][i].floorId == floorId)
            {
                floorIdx = i;
                break;
            }
        }
        return floorIdx;
    }

    // + waiting for each elevator order.
    // total time refer only to the first active floor
    // peekElevator is only for recommandation. Not for actual animate time.
    peekElevator(floorId)
    {
        if (this.allFloors[floorId]['active'])
            return;
        this.allFloors[floorId]['active'] = true;
        var remainTime;
        var minTime = Number.MAX_VALUE;
        var elevatorNo = 0;
        var startTime;
        var endTime = 0;
        var timeDiff = 0;
        var sumTotal = 0;
        for (var i=0; i< this.noOfElevators; i++)
        {
            var lastSumTotal = 0;
            [lastSumTotal, remainTime] = this._calculateRemainTotal(floorId, i);

            if (remainTime < minTime)
            {
                minTime = remainTime;
                elevatorNo = i;
                sumTotal = lastSumTotal;
            }
        }

        var diffTime = sumTotal - minTime;
        var distance = Math.abs(floorId - this.allElevators[elevatorNo]['floorId']);

        this._orderElevator.push({
            'state': ELEVATOR_STATE.Order,
            'elevatorNo': elevatorNo,
            'floorId': floorId,
            'diffTime': diffTime,
            'totalTime': sumTotal
        });    
    }

    // show all page on first time
    _showAll() 
    {
        $('#all_floors').empty();
        for (var i=this.noOfFloors; i>=0; i--)
        {
            var floor_container=$('<div/>', {
                class: 'floor_container'
            });

            $('<div/>', {
                class: 'floor'
            }).appendTo(floor_container);

            var floor_button = $('<button />', {
                class: 'metal linear',
                text: i,
                id: 'floor_button_' + i
            });

            floor_button.click(function(ev, tt){
                elevatorPeeker.findElevator(ev.target.textContent);
            });
            floor_button.appendTo(floor_container);
            if (i != this.noOfFloors)
            {
                $('<div/>', {
                    class: 'blackline',
                }).appendTo(floor_container);
            }

            this.allFloors[i] = {
                active: false
            }

            floor_container.appendTo('#all_floors');

            var countdown_object = $('<div/>', {
                    class: 'metal linear oval elevator_countdown',
                    id: 'elevator_countdown' + i
                });
            countdown_object.css({
                'top': ((this.noOfFloors -i) * 110 + 6) + 'px'
            });

            countdown_object.appendTo("#all_countdowns");

            var walkers = $('<div/>', {
                    class: 'walkers',
                    id: 'walkers' + i
                });
            walkers.css({
                'top': ((this.noOfFloors -i) * 110 + 6) + 'px'
            });

            walkers.appendTo("#all_countdowns");
            
        }

        for (var i=0; i < this.noOfElevators;i++)
        {
            var elevator = $('<div/>', {
                class: 'elevator',
                id: 'elevator' + i
            });
            elevator.css({top: (this.noOfFloors * 110) + 'px', left: (360 + i * 120) + 'px'})

            elevator.appendTo("#all_elevators");
            this.allElevators[i] = {
                id: "elevator" + i,
                floorId: 0,
                orderedFloorId: 0,
                totalTime: 0,
                extraTime: 0,
                floors: []
            };
        }
    }
    
}

var elevatorPeeker;

document.addEventListener("DOMContentLoaded", function(event) {
    elevatorPeeker = new ElevatorPeeker();
    elevatorPeeker.loadData();
  });
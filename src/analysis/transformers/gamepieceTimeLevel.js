const matchScoutingConfig = require("../../../config/match-scouting.json");
const { setPath, getPath } = require("../../lib/util");
const {DataTransformer} = require("../DataTransformer");

//const actionIds = matchScoutingConfig.layout.layers.flat().reduce((acc,button) => acc.includes(button.id) ? acc : acc.concat(button.id), []); //get list of unique actionIds from the buttons in config.json

module.exports = {
    /**
     * @type {DataTransformer}
     * @param options.all {Boolean} if true, count all actionIds in the config
     * @param options.ids {String[]} the array of actionIds to be counted
     * @param actionArrayPath {String} optional, the path to the array of actions in the tmp
     */
    team: new DataTransformer("gamepieceTimeLevel",(dataset,outputPath,options) => { //options {all: Boolean, ids: String[]}
        /* find which action ids should be counted */
        if (!options) throw new Error("no options provided! Please provide an array of ids or set all to true")
        //let gamepieceIds = options.ids;
        /*if (options.all) { //count all action ids
            gamepieceIds = []
        */
        var gamepieceIds = []
        var levels=[]
        for (let level in options.levelMap) {
            levels=levels.concat(level)
            for (let piece in options.levelMap[level]) {
                gamepieceIds=gamepieceIds.concat(options.levelMap[level][piece])
            }
        }
        //let actionArrayPath = options.actionArrayPath || "actionQueue";by default, count actions in the action queue
        let actionArrayPath = "actionQueue"; //by default, count actions in the action queue
        console.log("game piece ids: ", gamepieceIds)
        console.log("levels: ", levels)

        /* iterate through team objects for output paths */
        for (let [teamNumber,team] of Object.entries(dataset.teams)) {
            let teamTmps = dataset.tmps.filter(x=>x.robotNumber == teamNumber); //only the tmps that are this team's
            var timeslots = []
            for (let ts in options.timeSlots) {
                timeslots=timeslots.concat(ts)
            }
            var out = timeslots.reduce((acc,timeslot) => { 
            // construct an object of {id1: 0, id2: 0, id3: 0} at outputPath
               acc[timeslot] = new Map() 
                for (let piece of options.pickup) {
                    acc[timeslot][piece] = new Map()
                    for (let level of levels) {
                        acc[timeslot][piece][level] = 0;
                    }
                }
                return acc
            }, {});
            for (let tmp of teamTmps) {
                var i = 0;
                var actions = getPath(tmp,actionArrayPath)
                for (let action of actions) { //look at every action in the action queue
                    //find which time slot the action belongs to 
                    var auto_time_val=options.timeSlots["Auto"];
                    var teleop_time_val=options.timeSlots["Teleop"];
                    if (action.ts>=auto_time_val) {
                        timeslot="Auto"
                    } else if (action.ts <= teleop_time_val) {
                        timeslot="Teleop"
                    } else {
                        var skip_counts=true
                    }
                    //find if the action is related to cube/cone pickup
                    console.log("debug:", i, "->", action.id)
                    
                    console.log(gamepieceIds.includes(action.id))
                    if (gamepieceIds.includes(action.id)) {
                        //find the piece that was picked - cube or cone. It is in the action one before 
                        // the previous except the first two actions
                        if (i==0 || i==1) {
                            piece = actions[0].id
                            if (piece == "prePickupCone"){
                                piece = "conePickup"
                            }
                            else if (piece == "prePickupCube"){
                                piece = "cubePickup"
                            }
                        } else {
                            piece = actions[i-2].id 
                        }
                        if (skip_counts) continue
                        //find the level of the placement
                        var level =""
                        for (let l in options.levelMap) {
                            for (let piece in options.levelMap[l]) {
                                if (options.levelMap[l][piece].includes(action.id)) {
                                    level = l
                                    break
                                }
                            } 
                        }
                        console.log("debug2:", action.id, " ", timeslot,  " ", piece,  " level: ", level)
                        out[timeslot][piece][level]++; //increment the count of the action's id by 1 if it's supposed to be counted
                    
                    }
                    i++
                }
            }
            for (let timeslot in out) {
                for (let piece in out[timeslot]) {
                    for (let level of levels) {
                        outpath = [outputPath, timeslot, piece, level].join(".")
                        console.log("out=", outpath, ": ", out[timeslot][piece][level])
                        setPath(team,outpath,out[timeslot][piece][level])
                    }
                }
            }  
        }    
        return dataset;
    })
}

class Comments {
    container;
    moduleConfig;
    header;
    list;

    constructor(moduleConfig) {
        this.moduleConfig = moduleConfig
        this.container = createDOMElement("div", "container comments")
        this.header = createDOMElement("div", "header")
        this.list = createDOMElement("div", "list")
        this.container.appendChild(this.header)
        this.container.appendChild(this.list)
    }

    formatData(teams, dataset) {
        let allComments = "";
        for (let team of teams) {
            let teamTmps = dataset.tmps.filter(x=>x.robotNumber == team);
            for (let teamTmp of teamTmps){
                let matchNumber = teamTmp.matchNumber
                for (let action of teamTmp.actionQueue){
                    if (action.comment != ""){
                        allComments += ("Match "+ matchNumber + ": " + action.comment + "\n");
                    }
                }
            }
        }
        return allComments;
    }

    setData(data) {
        this.header.innerText = this.moduleConfig.name
        this.list.innerText = data
    }
}
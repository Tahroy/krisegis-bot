import AbstractSubCommandGroup from "../../utils/AbstractSubCommandGroup";
import Nourrir from "./bouftou/Nourrir";
import Caresser from "./bouftou/Caresser";
import Ajouter from "./bouftou/Ajouter";

class BouftouGroup extends AbstractSubCommandGroup {
    name: string = 'bouftou';
    description: string = "S'occuper des bouftous";

    constructor() {
        super();
        this.subCommands.set('nourrir', Nourrir);
        this.subCommands.set('caresser', Caresser);
        this.subCommands.set('ajouter', Ajouter);
    }
}

export default BouftouGroup;

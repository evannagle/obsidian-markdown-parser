import { TokenBlock } from "./TokenBlock";

export class UndefinedBlock extends TokenBlock {
	protected allowedChildren = []; // no child blocks
	protected lexeme: "";
	protected literal = "";
}

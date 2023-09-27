import { Block } from "./Block";

export class MutableBlock extends Block {
	public add = super.add;
	public addAfter = super.addAfter;
	public addAt = super.addAt;
	public addBefore = super.addBefore;
	public move = super.move;
	public remove = super.remove;
	public removeChildAt = super.removeChildAt;
	public replace = super.replace;
	public replaceChildAt = super.replaceChildAt;
	public sort = super.sort;
}

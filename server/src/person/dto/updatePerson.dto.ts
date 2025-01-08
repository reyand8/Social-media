import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonDto } from './createPerson.dto'


export class UpdatePersonDto extends PartialType(CreatePersonDto) {
	firstName: string;
	lastName: string;
	username: string;
	description: string;
	hobby: string[];
	image: string;
}
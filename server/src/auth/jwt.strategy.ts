import {Injectable, UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

import { PersonService } from '../person/person.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private personService: PersonService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET_KEY,
        });
    }

    async validate(payload: any) {
        const user = await this.personService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }
}


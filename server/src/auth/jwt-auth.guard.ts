import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return false;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return false;
        }
        try {
            request.user = await this.jwtService.verifyAsync(token);
            return true;
        } catch (error) {
            return false;
        }
    }
}

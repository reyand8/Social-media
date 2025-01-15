import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


/**
 * Guard to protect routes by validating JWT tokens.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    /**
     * Determines whether the current request is authorized by validating the JWT token.
     *
     * @param context - The execution context for the current request.
     * @returns A promise resolving to `true` if the token is valid, or `false` otherwise.
     */
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

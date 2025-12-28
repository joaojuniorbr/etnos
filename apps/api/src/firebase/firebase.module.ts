import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseAuthStrategy } from './firebase.strategy';
import { PassportModule } from '@nestjs/passport';

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'firebase-auth' })],
  providers: [FirebaseService, FirebaseAuthStrategy],
  exports: [FirebaseService],
})
export class FirebaseModule {}

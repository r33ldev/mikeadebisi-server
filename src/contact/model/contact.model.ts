import { getModelForClass, Prop } from '@typegoose/typegoose';
import { Field, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class Contact {
  @Field()
  @Prop({ nullable: true })
  name?: string;

  @Field()
  @Prop({ nullable: true })
  email?: string;

  @Field()
  @Prop({ nullable: true })
  message?: string;
}

export const ContactModel = getModelForClass<typeof Contact>(Contact);

@InputType()
export class newContactInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  message: string;
}

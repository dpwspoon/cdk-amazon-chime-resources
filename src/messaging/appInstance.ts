import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MessagingResources } from './messagingCustomResources';

export interface DataRetentionConfig {
  readonly dataRetention: Duration;
}
export enum AppInstanceDataType {
  CHANNEL = 'Channel',
  CHANNELMESSAGE = 'ChannelMessage',
}

export interface StreamingConfig {
  readonly appInstanceDataType: AppInstanceDataType;
  readonly resourceArn: string;
}
export type StreamingConfigs = Array<StreamingConfig>;

/**
 * Props for `AppInstance`.
 */
export interface AppInstanceProps {
  /**
   * The name of the app instance.
   *
   * @default - None
   */
  readonly name?: string;

  /**
   * The metadata of the app instance. Limited to a 1KB string in UTF-8.
   *
   * @default - None
   */
  readonly metadata?: string;

  /**
   * The ClientRequestToken of the app instance.  This field is autopopulated if not provided.
   *
   * @default - None
   */
  readonly clientRequestToken?: string;
}

export class MessagingAppInstance extends Construct {
  public readonly appInstanceArn: string;

  constructor(scope: Construct, id: string, props: AppInstanceProps) {
    super(scope, id);

    const uid: string = cdk.Names.uniqueId(this);

    const { name, metadata, clientRequestToken } = props;

    const appInstanceRequest = new MessagingResources(
      this,
      'MessagingAppInstance',
      {
        resourceType: 'AppInstance',
        uid: uid,
        properties: {
          name: name || uid,
          metadata: metadata,
          clientRequestToken: clientRequestToken,
        },
      },
    );

    this.appInstanceArn =
      appInstanceRequest.messagingCustomResource.getAttString('appInstanceArn');
  }

  streaming(streamingConfigs: StreamingConfigs) {
    const uid: string = cdk.Names.uniqueId(this);
    const result = new MessagingResources(
      this,
      'AppInstanceStreamingConfiguration',
      {
        resourceType: 'StreamingConfig',
        uid: uid,
        properties: {
          streamingConfigs: streamingConfigs,
          appInstanceArn: this.appInstanceArn,
        },
      },
    );
    return result;
  }

  retention(dataRetention: DataRetentionConfig) {
    const uid: string = cdk.Names.uniqueId(this);
    const result = new MessagingResources(
      this,
      'AppInstanceDataRetentionConfig',
      {
        resourceType: 'DataRetention',
        uid: uid,
        properties: {
          dataRetention: dataRetention,
          appInstanceArn: this.appInstanceArn,
        },
      },
    );
    return result;
  }
}

# SMTP Integration Architecture Diagrams

## Overview Diagram

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[SendNotificationController]
        B[Other Controllers]
    end

    subgraph "Application Layer"
        C[SendNotificationUseCase]
        D[EmailProviderFactory]
        E[ProviderSelectionStrategy]
    end

    subgraph "Domain Layer"
        F[Notification Entity]
        G[IEmailProvider Interface]
        H[NotificationDelivery Entity]
    end

    subgraph "Infrastructure Layer"
        subgraph "Providers"
            I[SendGridProvider]
            J[SMTPProvider]
            K[Other Providers]
        end

        subgraph "Repositories"
            L[NotificationRepository]
            M[NotificationDeliveryRepository]
            N[ProviderHealthRepository]
        end

        subgraph "Services"
            O[TemplateRenderer]
            P[SMTPErrorHandler]
            Q[EnhancedRetryManager]
        end
    end

    A --> C
    B --> C
    C --> D
    D --> E
    E --> I
    E --> J
    E --> K

    C --> F
    F --> G
    I --> G
    J --> G
    K --> G

    C --> L
    I --> M
    J --> M
    I --> N
    J --> N

    C --> O
    J --> P
    J --> Q
```

## Provider Selection Flow

```mermaid
flowchart TD
    A[Email Request] --> B{Determine Context}
    B --> C[Check Priority]
    C --> D{High/Urgent?}
    D -->|Yes| E[Select SendGrid]
    D -->|No| F{Marketing Content?}
    F -->|Yes| G[Select SendGrid]
    F -->|No| H{SendGrid Healthy?}
    H -->|Yes| I[Select SendGrid]
    H -->|No| J[Select SMTP]

    E --> K[Send Email]
    G --> K
    I --> K
    J --> K

    K --> L{Delivery Success?}
    L -->|Yes| M[Update Delivery Status]
    L -->|No| N{Retryable Error?}
    N -->|Yes| O[Schedule Retry with Alternative Provider]
    N -->|No| P[Mark as Failed]

    O --> Q[Exponential Backoff]
    Q --> R[Retry with Alternative Provider]
    R --> K
```

## SMTP Provider Architecture

```mermaid
graph TB
    subgraph "SMTP Provider"
        A[SMTPProvider]
        B[SMTPConfig]
        C[Nodemailer Transport]
        D[SMTPTemplateProcessor]
        E[SMTPErrorHandler]
        F[ConnectionPool]
    end

    subgraph "External Services"
        G[SMTP Server]
        H[Email Validation Service]
        I[Analytics Service]
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F

    C --> G
    D --> H
    A --> I
```

## Error Handling and Retry Flow

```mermaid
stateDiagram-v2
    [*] --> Processing
    Processing --> Sending
    Sending --> Success: Delivery OK
    Sending --> Error: Delivery Failed

    Error --> AnalyzeError
    AnalyzeError --> TransientError: Temporary Issue
    AnalyzeError --> PermanentError: Permanent Issue

    TransientError --> CanRetry: Retry Count < Max?
    CanRetry --> ScheduleRetry: Yes
    CanRetry --> MarkFailed: No

    PermanentError --> MarkFailed

    ScheduleRetry --> ExponentialBackoff
    ExponentialBackoff --> AlternativeProvider: Try Alternative?
    AlternativeProvider --> Sending: Yes
    AlternativeProvider --> MarkFailed: No

    MarkFailed --> [*]
    Success --> [*]
```

## Repository Implementation Flow

```mermaid
sequenceDiagram
    participant UC as SendNotificationUseCase
    participant EF as EmailProviderFactory
    participant SP as SMTPProvider
    participant NR as NotificationRepository
    participant DR as DeliveryRepository
    participant HR as HealthRepository

    UC->>EF: getProvider(context)
    EF->>HR: checkProviderHealth('smtp')
    HR-->>EF: healthStatus
    EF-->>UC: SMTPProvider

    UC->>NR: create(notification)
    NR-->>UC: savedNotification

    UC->>SP: send(notification, recipient)
    SP->>DR: createDelivery(delivery)
    DR-->>SP: deliveryRecord

    SP->>SP: sendEmail()
    SP->>DR: updateDeliveryStatus(delivered)
    SP->>HR: recordHealthCheck(success, responseTime)

    SP-->>UC: deliveryResult
    UC->>NR: update(notification)
```

## Configuration Hierarchy

```mermaid
graph TD
    A[Environment Variables] --> B[NotificationConfig]
    B --> C[EmailConfig]
    C --> D[ProvidersConfig]
    C --> E[SelectionConfig]
    C --> F[TemplateConfig]

    D --> G[SendGridConfig]
    D --> H[SMTPConfig]

    E --> I[Strategy]
    E --> J[PrimaryProvider]
    E --> K[FallbackProvider]
    E --> L[HealthCheckInterval]

    H --> M[Host/Port]
    H --> N[Authentication]
    H --> O[ConnectionPool]
    H --> P[RateLimiting]
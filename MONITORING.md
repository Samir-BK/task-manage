
# Task 6 — Monitoring

## Health Checks

Render's built-in HTTP health checks are configured for both
deployed services.

| Service | Health Check Path |
|---|---|
| Backend | `/api/health` |
| Frontend | `/` |

Health check timing is managed automatically by Render.

| Parameter | Value |
|---|---|
| Observed interval | Approximately 5 seconds |
| Response timeout | 5 seconds |
| Traffic removal | 15 seconds of consecutive failures |
| Automatic restart | 60 seconds of consecutive failures |

The default timing policy was retained because Render
does not expose separate timing controls in the dashboard.

## Notifications

Email notifications are configured in Render for both
the backend and frontend services.

- Notification destination: Email
- Backend: Only failure notifications
- Frontend: Only failure notifications
- Preview notifications: Disabled

This configuration supports alerts for failed deployments,
Docker image pull failures and unhealthy services.

## Verification

The following checks were completed successfully:

- Public backend health endpoint returned HTTP 200.
- Recurring health checks were verified in application logs.
- Health check intervals of approximately five seconds were observed.
- Network metrics and deployment events were reviewed.
- Email notification settings were verified.
- Release v1.0.0 remained live and operational.

## Limitations

- Automatic restart and actual failure email delivery
  were not deliberately tested.
- The backend health endpoint checks API responsiveness,
  not database connectivity.
- Health check timing is managed by Render.

## Evidence and References

- [Backend health endpoint](https://task-manage-backend-x2v4.onrender.com/api/health)
- [Live application](https://task-manage-frontend-qov5.onrender.com)
- [Deployment documentation](DEPLOYMENT.md)
- [Render Health Checks](https://render.com/docs/health-checks)
- [Render Notifications](https://render.com/docs/notifications)

## Conclusion

Monitoring was configured and verified using Render's
built-in health checks, email failure notifications,
application logs, metrics and deployment events.

No additional monitoring services or application source
code changes were required.

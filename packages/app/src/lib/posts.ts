export function calendarEventForPost(post: any) {
  return {
    title: post.text || 'No Content',
    start: post.scheduleTime,
    allDay: false,
  };
}

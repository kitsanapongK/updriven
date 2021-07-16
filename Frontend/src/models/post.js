export class StatusPost {
    constructor(
        hasNext,
        hasPrevious,
        next,
        previous) {
        this.hasNext = hasNext
        this.hasPrevious = hasPrevious
        this.nextID = next
        this.previousID = previous
    }
}

export class _create {
    constructor(subject = '', content = '', category = '', PVmedia = [], fileMedia = [], visible_to = '1') {
      this.subject = subject;
      this.content = content;
      this.category = category;
      this.PVmedia = PVmedia;
      this.fileMedia = fileMedia;
      this.visible_to = visible_to;
    }
}

export class _CommentPost {
    constructor(postID = '') {
        this.postID = postID;
        this.comment = '';
        this.parentCommentID = null;
        this.depth = null;
    }
}

export function changeStructurePost(posts) {
    let temp_array = []
    for(let i = 0; i < posts.length; i++){
        var temp_data = posts[i];
        var shared = null

        if (temp_data['user'].length <= 0) {
            continue;
        }
        
        if (temp_data['share'].length > 0) {
            shared = {
                firstname: temp_data['user'][0]['user_detail'][0]['firstname'],
                lastname: temp_data['user'][0]['user_detail'][0]['lastname'],
                is_sentiment: temp_data['is_sentiment'],
                sentiment_count: temp_data['sentiment_count'],
                comment_count: temp_data['comment_count'],
                createdAt: temp_data['createdAt'],
                _id: temp_data['_id'],
                origin: temp_data['share'][0]['post'][0]['_id'],
                user: temp_data['user'][0]['_id']
            }
            temp_data = temp_data['share'][0]['post'][0]
        }
        
        temp_array.push({
            shared: shared,
            sharedUser: shared ? shared.user : null,
            id: shared? shared._id : temp_data['_id'],
            image: temp_data['media'],
            title: temp_data['subject'],
            desc: temp_data['content'],
            createdAt: temp_data['createdAt'],
            user: {
                id: temp_data['user'][0]['_id'],
                firstname: temp_data['user'][0]['user_detail'][0]['firstname'],
                lastname: temp_data['user'][0]['user_detail'][0]['lastname'],
                avatar: temp_data['user'][0]['_id'],
            },
            counts: {
                likes: shared ? shared.sentiment_count : temp_data['sentiment_count'],
                comments: shared ? shared.comment_count : temp_data['comment_count'],
            },
            actions: {
                shared: false,
                liked: shared ? shared.is_sentiment :  temp_data['is_sentiment'],
                followed: false,
            },
            comments: []
        })
    }

    return temp_array;
}

export function changeStructureFetchComment(objectComments) {

    const commentKeys = Object.keys(objectComments)
    let comments = []
    for(let i = 0; i < commentKeys.length; i++){
        const comment = objectComments[commentKeys[i]];
        const childKeys = Object.keys(comment['children'])

        comments.push({
            id: comment['_id'],
            comment: comment['comment'],
            createdAt: comment['createdAt'],
            postID: comment['post_id'],
            user: {
                id: comment['author']['id'],
                firstname: comment['author']['firstname'],
                lastname: comment['author']['lastname'],
                avatar: '/assets/img/profile/01.jpg'
            },
            counts: {
                likes: comment['sentiment_count']
            },
            actions: {
                liked: false
            },
            depth: comment['depth'],
            children: ( childKeys.length > 0? changeStructureFetchComment(comment['children']) : {} )
        })
    }
    return comments;
}
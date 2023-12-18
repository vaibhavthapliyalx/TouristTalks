import { Component, Input } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User, Review, FeedbackType } from 'src/interface/constants';
import { getStars } from 'src/utils/utilityfunctions';
import ApiConnector from '../APIConnector/ApiConnector';

@Component({
  selector: 'app-user-reviews',
  templateUrl: './user-reviews.component.html',
  styleUrls: ['./user-reviews.component.css']
})
export class UserReviewsComponent {
/**
  * Here we are importing the getStars function from the utilityfunctions.ts file.
  * And then pass its reference to the getStars property.
  * This can be used in the HTML file to fetch the stars array
  */
getStars = getStars;
@Input()userId: string = '';
@Input()reviewType: string = 'myReviews' || 'likedReviews';
reviewer: User = {} as User;
editingReviewId: string | undefined = '';

reviews: Review[] = [];
showReviewForm = false;
reviewForm = this.fb.group({
  text: ['', Validators.required],
  rating: [0, Validators.required],
  likes: [0, Validators.required]
});

constructor(private route: ActivatedRoute, private apiConnector: ApiConnector, private fb: FormBuilder) {}

/**
 * On component mount, fetch the user and their reviews.
 */
ngOnInit() {
  this.apiConnector.getUserByUserId(this.userId)
  .then((res: any) => {
    console.log(res);
    this.reviewer = res;
    this.getMyReviews(this.userId);
  })
  .catch((err: any) => {
    console.log(err);
  });
}
showForm() {
  this.showReviewForm = !this.showReviewForm;
}

/**
 * Fetches the reviews for the logged in user.
 * 
 * @ImplementationNotes
 * 1. If the reviewType is 'myReviews', fetch the reviews written by the user.
 * 2. If the reviewType is 'likedReviews', fetch the reviews liked by the user.
 * This is done to make sure the tab is consistent with the reviews shown.
 */
getMyReviews(userId: string) {
  if (this.reviewType === 'myReviews') {
    this.apiConnector.getMyReviews(userId)
      .then((res: any) => {
        this.reviews = res.map((review: Review) => ({
          ...review,
          liked: this.isReviewLiked(review)
        }));
        console.log(this.reviews);
      })
      .catch((err: any) => {
        console.log(err);
    });
  } else if (this.reviewType === 'likedReviews') {
    this.apiConnector.getReviewsLikedByUser(userId)
    .then((res: any) => {
      this.reviews = res.map((review: Review) => ({
        ...review,
        liked: true
      }));
      console.log(this.reviews);
    })
    .catch((err: any) => {
      console.log(err);
    });
  } else {
    console.log('Invalid review type');
  }
}

/**
 * Like/unlike a review.
 * 
 * @param review The review to be liked/unliked.
 */
toggleLike(review: Review) {  
  if (review.liked === undefined) {
    review.liked = this.isReviewLiked(review);
  }
  review.liked = !review.liked;
  let feedback = review.liked ? FeedbackType.Like : FeedbackType.Dislike;
  review.likes += review.liked ? 1 : -1;
  
  this.apiConnector.pushUserReviewFeedback(review.review_id?? '',this.reviewer.id ?? '', feedback)
  .then((res: any) => {
    console.log(res);
  })
  .catch((err: any) => {
    console.log(err);
  })
  .finally(()=> {
    // Remove the review from the list of liked reviews if the user unlikes it
    if(feedback === FeedbackType.Dislike && this.reviewType === 'likedReviews') {
      this.reviews = this.reviews.filter((res: Review) => {
        return res.review_id !== review.review_id;
      });
      
    }
  })

}

/**
 *  Check if the review is liked by the user.
 * 
 * @param review  The review object.
 * @returns  True if the review is liked by the user, false otherwise.
 */
isReviewLiked(review: Review): boolean {
  console.log(review);
  let liked = false;
  if (review.review_id && (this.reviewer.likedReviews?.includes(review.review_id))) {
    liked = true;
  } else {
    liked = false;
  }
  review.liked = liked;
  
  return review.liked;
}
}

